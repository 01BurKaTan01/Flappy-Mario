package main

import (
	"html/template"
	"log"
	"net/http"
)

func main() {
	// Serve static files from the ./static directory.
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Serve the index.html file.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		t, _ := template.ParseFiles("templates/index.html")
		t.Execute(w, nil)
	})

	log.Println("Server starting on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
