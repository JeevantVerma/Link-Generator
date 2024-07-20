package admin

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type admindetail struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	JoinDate string `json:"joinDate"`
}

var db *sql.DB

func SetDBConnection(dbSql *sql.DB) {
	db = dbSql
}

func AddAdmin(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	fmt.Println(string(body))
	var req admindetail
	err = json.Unmarshal(body, &req)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	query := `INSERT INTO admin (email, password, joinDate) VALUES ($1, $2, $3)`
	password, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 8)

	currentTime := time.Now()
	joinDate := time.Date(currentTime.Year(), currentTime.Month(), currentTime.Day(), 0, 0, 0, 0, currentTime.Location())
	joinDateString := joinDate.Format("2006-01-02")

	_, err = db.ExecContext(ctx, query, req.Email, password, joinDateString)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(req)
	w.Write([]byte("Admin Added"))
}

func GetAllAdmins(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	query := `SELECT email, joinDate FROM admin`

	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var admins []admindetail
	for rows.Next() {
		var admin admindetail
		var joinDate time.Time

		if err := rows.Scan(&admin.Email, &joinDate); err != nil {
			log.Printf("Error scanning row: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		admin.JoinDate = joinDate.Format("02-01-2006")

		admins = append(admins, admin)
	}
	if err := rows.Err(); err != nil {
		log.Printf("Error iterating over rows: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(admins); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

func RemoveAdmin(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req struct {
		Email string `json:"email"`
	}
	err = json.Unmarshal(body, &req)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	query := `DELETE FROM admin WHERE email = $1`

	result, err := db.ExecContext(ctx, query, req.Email)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error getting rows affected: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Admin not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Admin Removed"))
}
