package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	auth "github.com/MicrosoftStudentChapter/Link-Generator/pkg/auth"
	router "github.com/MicrosoftStudentChapter/Link-Generator/pkg/router"
	"github.com/gorilla/mux"
	"github.com/redis/go-redis/v9"
	"github.com/rs/cors"
)

func main() {
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

	r := mux.NewRouter()

	// Define routes
	r.HandleFunc("/links/all", router.GetAllLinks).Methods(http.MethodOptions, http.MethodGet)
	r.HandleFunc("/login", auth.Login).Methods(http.MethodOptions, http.MethodGet)
	r.HandleFunc("/show", auth.ShowUsers).Methods(http.MethodOptions, http.MethodPost)
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Service is Alive"))
	}).Methods(http.MethodOptions, http.MethodGet)
	r.HandleFunc("/add-link", router.AddLink).Methods(http.MethodOptions, http.MethodPost)
	r.HandleFunc("/{link}", router.HandleRouting).Methods(http.MethodOptions, http.MethodGet)

	// Middlewares
	r.Use(LoggingMiddleware)
	r.Use(mux.CORSMethodMiddleware(r))
	r.Use(HandlePreflight)

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Change this to your front-end URL
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST"},
		AllowedHeaders:   []string{"Authorization"},
	})

	handler := c.Handler(r)
	fmt.Println("Server started at port 4000")
	http.ListenAndServe(":4000", handler)
}

// Middlewares

func HandlePreflight(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173") // Change this to your frontend URL
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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
