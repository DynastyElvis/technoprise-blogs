package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"database/sql"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type BlogPost struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Date    string `json:"date"`
	Slug    string `json:"slug"`
	Content string `json:"content"`
	Excerpt string `json:"excerpt"`
}

// In-memory database for simplicity
var blogPosts = []BlogPost{
	{
		ID:      1,
		Title:   "Understanding Elvis",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations. In this piece, we will provide a brief introduction to compensatory damages and the role they serve in ADA cases. What are compensatory damages? The Equal Employment Opportunity Commission (EEOC) defines compensatory damages as damages that 'restore for or make up for losses caused by discrimination.' The EEOC also explains that compensatory damages may also cover 'any emotional harm suffered (such as mental anguish, inconvenience, or loss of enjoyment of life)' to put it simply. In contrast, the corrective purpose of compensatory damages is to help plantiff suffer as a result of a claimed offense; Are there damages other than compensatory? Compensatory damages differ from punitive damages. Punitive damages serve the sole purpose of reprimanding a defendant. The different kinds of compensatory damages. There are two kinds of compensatory damages. The first is special damages. Special damages refer to easily calculated damages that have bills. For instance, court can easily calculate amount to include there medical expenses for emotional stress. The other kinds of compensatory damages are what's known as general damages. These include recognizing for items such as pain, suffering and emotional stress being. These damages are difficult to calculate as the amount required to satisfy them is much more subjective than is special damages.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      2,
		Title:   "Understanding Elvis 3",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-2",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      3,
		Title:   "Understanding Elvis 4",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-3",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      4,
		Title:   "Understanding Elvis 5",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-4",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      5,
		Title:   "Understanding Compensatory Damages in an ADA Context",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-5",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      6,
		Title:   "Understanding Compensatory Damages in an ADA Context",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-6",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      7,
		Title:   "Understanding Compensatory Damages in an ADA Context",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-7",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      8,
		Title:   "Understanding Compensatory Damages in an ADA Context",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-8",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
	{
		ID:      9,
		Title:   "Understanding Compensatory Damages in an ADA Context",
		Date:    "Dec 2023 • 5 min Read",
		Slug:    "understanding-compensatory-damages-ada-9",
		Content: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up the sum of remedies owed by defendants found guilty of ADA violations.",
		Excerpt: "In ADA cases, prevailing plaintiffs are often awarded what's known as compensatory damages. These, along with punitive damages, help make up...",
	},
}

// Get all blog posts with pagination
func getBlogPosts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get query parameters
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	search := r.URL.Query().Get("search")

	// Default values
	page := 1
	limit := 6

	// Parse page and limit
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	// Filter posts based on search query
	filteredPosts := blogPosts
	if search != "" {
		var searchResults []BlogPost
		searchLower := strings.ToLower(search)
		for _, post := range blogPosts {
			if strings.Contains(strings.ToLower(post.Title), searchLower) ||
				strings.Contains(strings.ToLower(post.Content), searchLower) {
				searchResults = append(searchResults, post)
			}
		}
		filteredPosts = searchResults
	}

	// Calculate pagination
	total := len(filteredPosts)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		start = total
		end = total
	} else if end > total {
		end = total
	}

	// Get paginated posts
	var paginatedPosts []BlogPost
	if start < total {
		paginatedPosts = filteredPosts[start:end]
	} else {
		paginatedPosts = []BlogPost{}
	}

	// Response structure
	response := map[string]interface{}{
		"posts":       paginatedPosts,
		"total":       total,
		"page":        page,
		"totalPages":  (total + limit - 1) / limit,
		"hasNext":     page*limit < total,
		"hasPrevious": page > 1,
	}

	json.NewEncoder(w).Encode(response)
}

// Get single blog post by slug
func getBlogPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	slug := vars["slug"]

	for _, post := range blogPosts {
		if post.Slug == slug {
			json.NewEncoder(w).Encode(post)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Post not found"})
}

// Create new blog post
func createBlogPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var newPost BlogPost
	if err := json.NewDecoder(r.Body).Decode(&newPost); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON"})
		return
	}

	// Generate ID and slug
	newPost.ID = len(blogPosts) + 1
	newPost.Date = time.Now().Format("Jan 2006") + " • 5 min Read"

	// Generate slug from title if not provided
	if newPost.Slug == "" {
		newPost.Slug = strings.ToLower(strings.ReplaceAll(newPost.Title, " ", "-"))
	}

	// Generate excerpt if not provided
	if newPost.Excerpt == "" {
		if len(newPost.Content) > 100 {
			newPost.Excerpt = newPost.Content[:100] + "..."
		} else {
			newPost.Excerpt = newPost.Content
		}
	}

	blogPosts = append(blogPosts, newPost)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newPost)
}

func main() {
	// Optional DB connection via env var
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Printf("DB_DSN not set; using in-memory posts")
	} else {
		if db, err := sql.Open("mysql", dsn); err != nil {
			log.Printf("[WARN] cannot open DB: %v", err)
		} else if err := db.Ping(); err != nil {
			log.Printf("[WARN] cannot ping DB: %v", err)
		} else {
			log.Printf("Connected to MySQL successfully")
			defer db.Close()
		}
	}

	r := mux.NewRouter()

	// API routes
	r.HandleFunc("/api/posts", getBlogPosts).Methods("GET")
	r.HandleFunc("/api/posts/{slug}", getBlogPost).Methods("GET")
	r.HandleFunc("/api/posts", createBlogPost).Methods("POST")

	// Enable CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:4200"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
