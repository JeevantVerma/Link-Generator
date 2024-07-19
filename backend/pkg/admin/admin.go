package admin

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type admindetail struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var db *sql.DB
var conn string

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

	query := `INSERT INTO admin (email, password) VALUES ($1, $2)`
	password, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 8)
	_, err = db.ExecContext(ctx, query, req.Email, password)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(req)
	w.Write([]byte("Admin Added"))
}
