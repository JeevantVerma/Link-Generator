package auth

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	cookie "github.com/MicrosoftStudentChapter/Link-Generator/pkg/cookies"
	"github.com/labstack/gommon/log"

	"github.com/golang-jwt/jwt"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))
var db *sql.DB

type User struct {
	Email    string
	Password string
}

type Response struct {
	Status      string `json:"status"`
	RedirectUrl string `json:"redirectUrl,omitempty"`
	Message     string `json:"message,omitempty"`
}

type Claims struct {
	Email string `json:"email"`
	jwt.StandardClaims
}

func init() {
	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatal("Error loading .env file")
	}

	connStr := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("SQL_USER"),
		os.Getenv("SQL_PASSWORD"),
		os.Getenv("SQL_DATABASE_NAME"))

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
}

func GenerateTokenAndSetCookies(w http.ResponseWriter, r *http.Request, email string) string {
	if email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return ""
	}

	expirationTime := time.Now().Add(30 * time.Minute)
	claims := &Claims{
		Email: email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
			IssuedAt:  time.Now().Unix(),
			Issuer:    "Linky",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return ""
	}

	cookie.SetTokenCookie("access-token", tokenString, expirationTime, w)

	return tokenString
}

func ValidateJWT(tokenString string) (string, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			return "", http.ErrBodyNotAllowed
		}
		return "", err
	}
	if !token.Valid {
		return "", http.ErrBodyNotAllowed
	}
	return claims.Email, nil
}

func Login(w http.ResponseWriter, r *http.Request) {

	credentials := struct {
		Email    string
		Password string
	}{
		Email:    r.Header.Get("Email"),
		Password: r.Header.Get("Password"),
	}

	if credentials.Email == "" || credentials.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{Status: "fail", Message: "Email and password are required"})
		return
	}

	user, err := GetUserByEmail(credentials.Email)
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{Status: "fail email", Message: "Invalid Login"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{Status: "fail login", Message: "Invalid Login"})
		return
	}

	tokenString := GenerateTokenAndSetCookies(w, r, credentials.Email)
	if tokenString == "" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{Status: "fail", Message: "Token is missing"})
		return
	}

	_, err = ValidateJWT(tokenString)
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{Status: "fail", Message: err.Error(), RedirectUrl: "http://localhost:5173/error"})
		return
	}

	url := "/Adminpage"
	fmt.Printf("Route Url: " + url)
	json.NewEncoder(w).Encode(Response{Status: "success", RedirectUrl: url})
}

func GetUserByEmail(email string) (*User, error) {
	ctx := context.Background()
	query := `SELECT email, password FROM admin WHERE email=$1`
	row := db.QueryRowContext(ctx, query, email)
	user := &User{}
	err := row.Scan(&user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Warnf("No user found with email: %s", email)
			return nil, fmt.Errorf("user not found")
		}
		log.Errorf("Error fetching user by email: %v", err)
		return nil, err
	}
	return user, nil
}

func ShowUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	users, err := GetAllUsers()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{Status: "fail", Message: "Error fetching users"})
		return
	}
	json.NewEncoder(w).Encode(users)
}

func GetAllUsers() ([]*User, error) {
	ctx := context.Background()
	query := `SELECT email, password FROM admin`
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		user := &User{}
		if err := rows.Scan(&user.Email, &user.Password); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}
