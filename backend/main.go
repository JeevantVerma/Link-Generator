package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"database/sql"

	admin "github.com/MicrosoftStudentChapter/Link-Generator/pkg/admin"
	auth "github.com/MicrosoftStudentChapter/Link-Generator/pkg/auth"
	router "github.com/MicrosoftStudentChapter/Link-Generator/pkg/router"
	"github.com/gorilla/mux"
	"github.com/labstack/gommon/log"
	"github.com/redis/go-redis/v9"
)

func main() {
	var db *sql.DB
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = ":6379"
	}
	fmt.Println("Connecting Redis to: ", redisAddr)
	conn := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "",
		DB:       0,
	})
	router.Mem = conn
	res, err := conn.Ping(context.Background()).Result()
	if err != nil {
		panic(err)
	}
	fmt.Println("Redis [PING]: ", res)

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		os.Getenv("SQL_HOST"),
		os.Getenv("SQL_PORT"),
		os.Getenv("SQL_USER"),
		os.Getenv("SQL_PASSWORD"),
		os.Getenv("SQL_DATABASE_NAME"))

	db, err = sql.Open("postgres", connStr)

	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}

	admin.SetDBConnection(db)
	auth.SetDBConnection(db)

	r := mux.NewRouter()

	r.HandleFunc("/links/all", router.GetAllLinks).Methods(http.MethodOptions, http.MethodGet)
	r.HandleFunc("/login", auth.Login).Methods(http.MethodOptions, http.MethodGet)
	r.HandleFunc("/show", auth.ShowUsers).Methods(http.MethodOptions, http.MethodPost)
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Service is Alive"))
	}).Methods(http.MethodOptions, http.MethodGet)
	r.HandleFunc("/add-link", router.AddLink).Methods(http.MethodOptions, http.MethodPost)
	r.HandleFunc("/add-admin", admin.AddAdmin).Methods(http.MethodOptions, http.MethodPost)
	r.HandleFunc("/get-admin", admin.GetAllAdmins).Methods(http.MethodOptions, http.MethodGet)
	r.HandleFunc("/{link}", router.HandleRouting).Methods(http.MethodOptions, http.MethodGet)

	// Middlewares
	r.Use(LoggingMiddleware)
	r.Use(mux.CORSMethodMiddleware(r))
	r.Use(HandlePreflight)
	fmt.Println("Server started at port 4000")
	http.ListenAndServe(":4000", r)
}

// Middlewares

func HandlePreflight(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Origin, email, password")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Logger:  ", r.Method, r.URL)
		next.ServeHTTP(w, r)
	})
}
