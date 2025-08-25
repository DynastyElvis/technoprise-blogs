-- MySQL schema for blogs database
-- Run this entire script in MySQL Workbench

-- 1) Create database (change collation if you prefer)
CREATE DATABASE IF NOT EXISTS technoprise_blogs
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE technoprise_blogs;

-- 2) Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  excerpt VARCHAR(255) NOT NULL,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_posts_slug (slug),
  INDEX idx_blog_posts_published_at (published_at),
  FULLTEXT KEY ft_blog_posts_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Seed a couple of rows (optional)
INSERT INTO blog_posts (title, slug, content, excerpt, published_at)
VALUES
  (
    'Welcome to the Blog',
    'welcome-to-the-blog',
    'This is a placeholder post to verify DB connectivity.',
    'This is a placeholder post to verify DB connectivity.',
    NOW()
  ),
  (
    'Second Post',
    'second-post',
    'Another example post stored in MySQL.',
    'Another example post stored in MySQL.',
    NOW()
  );


