package auth

import (
	// "fmt"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	cookie "github.com/MicrosoftStudentChapter/Link-Generator/pkg/cookies"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))
var users = map[string]string{}

type User struct {
	ID       string
	Username string
	Password string
}

type Response struct {
	Status      string `json:"status"`
	RedirectUrl string `json:"redirectUrl,omitempty"`
	Message     string `json:"message,omitempty"`
}

type Claims struct {
	Username string "json:username"
	jwt.StandardClaims
}

func GenerateTokenAndSetCookies(w http.ResponseWriter, r *http.Request, username string) string {
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return ""
	}

	expirationTime := time.Now().Add(30 * time.Minute)
	claims := &Claims{
		Username: username,
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
	return claims.Username, nil
}

func Login(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	password := r.URL.Query().Get("password")

	var loggedInUser *User

	users := GetUsers()

	for _, user := range users {
		if user.Username != username {
			continue
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err == nil {
			loggedInUser = user
			break
		}
	}

	if loggedInUser == nil {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{Status: "fail", Message: "Invalid Login"})
		return
	}
	tokenString := GenerateTokenAndSetCookies(w, r, username)

	if tokenString == "" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{Status: "fail", Message: "Token is missing"})
		return
	}

	_, err := ValidateJWT(tokenString)
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{Status: "fail", Message: err.Error(), RedirectUrl: "http://localhost:5173/error"})
		return
	}

	url := "http://localhost:5173/link-gen"
	fmt.Printf("Route Url: " + url)
	json.NewEncoder(w).Encode(Response{Status: "success", RedirectUrl: url})
}

func Register(w http.ResponseWriter, r *http.Request) {
	var userData struct {
		Username string `json:"user"`
		Password string `json:"pass"`
	}

	if err := json.NewDecoder(r.Body).Decode(&userData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if _, exists := users[userData.Username]; exists {
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}

	users[userData.Username] = userData.Password

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})
}

func GetUsers() []*User {
	password, _ := bcrypt.GenerateFromPassword([]byte("12345"), 8)

	return []*User{
		{
			ID:       "1",
			Username: "Preet",
			Password: string(password),
		},
		{
			ID:       "2",
			Username: "Jeevant",
			Password: string(password),
		},
		{
			ID:       "3",
			Username: "Akshat",
			Password: string(password),
		},
	}
}

func ShowUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
