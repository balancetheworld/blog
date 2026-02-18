import initSqlJs, { type Database } from "sql.js"

let db: Database | null = null
let initPromise: Promise<Database> | null = null

export async function getDB(): Promise<Database> {
  if (db) return db

  if (!initPromise) {
    initPromise = (async () => {
      const SQL = await initSqlJs()
      db = new SQL.Database()

      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          category TEXT DEFAULT 'default',
          cover_image TEXT,
          view_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS post_translations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          lang TEXT NOT NULL,
          title TEXT NOT NULL,
          summary TEXT DEFAULT '',
          content TEXT DEFAULT '',
          FOREIGN KEY (post_id) REFERENCES posts(id),
          UNIQUE(post_id, lang)
        );

        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nid INTEGER UNIQUE NOT NULL,
          view_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS note_translations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note_id INTEGER NOT NULL,
          lang TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT DEFAULT '',
          FOREIGN KEY (note_id) REFERENCES notes(id),
          UNIQUE(note_id, lang)
        );

        CREATE TABLE IF NOT EXISTS recently (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          image_url TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS profile (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL,
          avatar TEXT,
          introduce TEXT DEFAULT '',
          github TEXT,
          twitter TEXT,
          email TEXT
        );

        CREATE TABLE IF NOT EXISTS i18n_labels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lang TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          UNIQUE(lang, key)
        );

        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          display_name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          expires_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES admin_users(id)
        );

        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          article_type TEXT NOT NULL,
          article_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES admin_users(id)
        );

        CREATE TABLE IF NOT EXISTS likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          article_type TEXT NOT NULL,
          article_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(article_type, article_id, user_id),
          FOREIGN KEY (user_id) REFERENCES admin_users(id)
        );

        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          name_en TEXT NOT NULL,
          name_zh TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS post_tags (
          post_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (post_id, tag_id),
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
      `)

      // Seed data
      const countResult = db.exec("SELECT COUNT(*) as count FROM i18n_labels")
      const count = countResult[0]?.values[0]?.[0] as number
      if (count === 0) {
        seedAll(db)
      }

      return db
    })()
  }

  return initPromise
}

function seedAll(database: Database) {
  // Default admin user (password: admin123)
  // SHA-256 of "admin123"
  const adminPasswordHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
  database.run(
    `INSERT INTO admin_users (username, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?)`,
    ["admin", adminPasswordHash, "Admin", "admin", new Date().toISOString()]
  )

  // Profile
  database.run(
    `INSERT INTO profile (id, name, username, avatar, introduce, github, twitter, email)
     VALUES (1, 'Alex Chen', 'alexchen', NULL, 'A developer passionate about building beautiful web experiences.', 'https://github.com', 'https://twitter.com', 'hello@example.com')`
  )

  // i18n labels - comprehensive dictionary
  const labels = [
    // -- English --
    // Site
    ["en", "site.title", "Alex's Space"],
    ["en", "site.description", "Thoughts, stories and ideas."],
    ["en", "site.subtitle", "A personal space for sharing ideas"],

    // Navigation
    ["en", "nav.home", "Home"],
    ["en", "nav.about", "About"],
    ["en", "nav.posts", "Posts"],
    ["en", "nav.notes", "Notes"],
    ["en", "nav.recently", "Thoughts"],
    ["en", "nav.friends", "Friends"],
    ["en", "nav.backToTop", "Back to top"],

    // Hero / Profile
    ["en", "hero.greeting", "Hello, I'm"],
    ["en", "hero.name", "Alex Chen"],
    ["en", "hero.tagline", "A developer who writes about code, design, and life."],

    // Section headers
    ["en", "section.articles", "Articles"],
    ["en", "section.articles.desc", "Thoughts and tutorials on development"],
    ["en", "section.articles.viewAll", "View all articles"],
    ["en", "section.notes", "Notes"],
    ["en", "section.notes.desc", "Quick notes and study records"],
    ["en", "section.notes.viewAll", "View all notes"],
    ["en", "section.recently", "Thoughts"],
    ["en", "section.recently.desc", "Short thoughts and daily musings"],
    ["en", "section.recently.viewAll", "View all thoughts"],

    // Blog / Posts
    ["en", "blog.readMore", "Read more"],
    ["en", "blog.back", "Back to posts"],
    ["en", "blog.empty", "No posts yet."],
    ["en", "blog.category", "Category"],
    ["en", "blog.publishedAt", "Published"],
    ["en", "blog.updatedAt", "Updated"],
    ["en", "blog.minRead", "min read"],
    ["en", "blog.toc", "Table of Contents"],
    ["en", "blog.share", "Share this post"],
    ["en", "blog.relatedPosts", "Related Posts"],

    // Notes
    ["en", "notes.empty", "No notes yet."],
    ["en", "notes.back", "Back to notes"],
    ["en", "notes.writtenOn", "Written on"],

    // Recently / Thoughts
    ["en", "recently.empty", "No thoughts yet."],
    ["en", "recently.justNow", "Just now"],
    ["en", "recently.minutesAgo", "minutes ago"],
    ["en", "recently.hoursAgo", "hours ago"],
    ["en", "recently.daysAgo", "days ago"],
    ["en", "recently.weeksAgo", "weeks ago"],

    // About
    ["en", "about.title", "About Me"],
    ["en", "about.content", "I am a developer passionate about building beautiful web experiences. I write about technology, design thinking, and the intersection of code and creativity."],
    ["en", "about.skills", "Skills"],
    ["en", "about.experience", "Experience"],
    ["en", "about.contact", "Get in touch"],
    ["en", "about.socialLinks", "Find me on"],

    // Footer
    ["en", "footer.copyright", "All rights reserved."],
    ["en", "footer.powered", "Powered by"],
    ["en", "footer.builtWith", "Built with Next.js & Koa"],

    // Common
    ["en", "common.loading", "Loading..."],
    ["en", "common.error", "Something went wrong"],
    ["en", "common.retry", "Try again"],
    ["en", "common.notFound", "Page not found"],
    ["en", "common.notFound.desc", "The page you are looking for does not exist."],
    ["en", "common.backHome", "Back to home"],
    ["en", "common.search", "Search"],
    ["en", "common.search.placeholder", "Search posts, notes..."],
    ["en", "common.noResults", "No results found"],

    // Theme
    ["en", "theme.light", "Light mode"],
    ["en", "theme.dark", "Dark mode"],
    ["en", "theme.system", "System"],

    // Language
    ["en", "lang.switch", "Language"],
    ["en", "lang.en", "English"],
    ["en", "lang.zh", "Chinese"],

    // Admin
    ["en", "admin.login", "Admin Login"],
    ["en", "admin.loginDesc", "Sign in to manage your blog"],
    ["en", "admin.username", "Username"],
    ["en", "admin.password", "Password"],
    ["en", "admin.signIn", "Sign In"],
    ["en", "admin.dashboard", "Dashboard"],
    ["en", "admin.welcome", "Welcome"],
    ["en", "admin.logout", "Logout"],
    ["en", "admin.articles", "Articles"],
    ["en", "admin.recently", "Thoughts"],
    ["en", "admin.categories", "Categories"],
    ["en", "category.all", "All"],

    // Time
    ["en", "time.year", "year"],
    ["en", "time.years", "years"],
    ["en", "time.month", "month"],
    ["en", "time.months", "months"],
    ["en", "time.day", "day"],
    ["en", "time.days", "days"],
    ["en", "time.ago", "ago"],
    ["en", "time.today", "Today"],
    ["en", "time.yesterday", "Yesterday"],

    // -- Chinese --
    // Site
    ["zh", "site.title", "Alex\u7684\u7a7a\u95f4"],
    ["zh", "site.description", "\u601d\u8003\u3001\u6545\u4e8b\u4e0e\u60f3\u6cd5\u3002"],
    ["zh", "site.subtitle", "\u4e00\u4e2a\u5206\u4eab\u60f3\u6cd5\u7684\u4e2a\u4eba\u7a7a\u95f4"],

    // Navigation
    ["zh", "nav.home", "\u9996\u9875"],
    ["zh", "nav.about", "\u5173\u4e8e"],
    ["zh", "nav.posts", "\u6587\u7ae0"],
    ["zh", "nav.notes", "\u624b\u8bb0"],
    ["zh", "nav.recently", "\u788e\u788e\u5ff5"],
    ["zh", "nav.friends", "\u670b\u53cb\u4eec"],
    ["zh", "nav.backToTop", "\u56de\u5230\u9876\u90e8"],

    // Hero / Profile
    ["zh", "hero.greeting", "\u4f60\u597d\uff0c\u6211\u662f"],
    ["zh", "hero.name", "Alex Chen"],
    ["zh", "hero.tagline", "\u4e00\u4f4d\u70ed\u8877\u4e8e\u7f16\u5199\u4ee3\u7801\u3001\u8bbe\u8ba1\u548c\u751f\u6d3b\u7684\u5f00\u53d1\u8005\u3002"],

    // Section headers
    ["zh", "section.articles", "\u6587\u7ae0"],
    ["zh", "section.articles.desc", "\u5173\u4e8e\u5f00\u53d1\u7684\u601d\u8003\u548c\u6559\u7a0b"],
    ["zh", "section.articles.viewAll", "\u9605\u8bfb\u5168\u90e8\u6587\u7ae0"],
    ["zh", "section.notes", "\u624b\u8bb0"],
    ["zh", "section.notes.desc", "\u968f\u8bb0\u548c\u5b66\u4e60\u7b14\u8bb0"],
    ["zh", "section.notes.viewAll", "\u67e5\u770b\u5168\u90e8\u624b\u8bb0"],
    ["zh", "section.recently", "\u788e\u788e\u5ff5"],
    ["zh", "section.recently.desc", "\u65e5\u5e38\u77ed\u60f3\u6cd5\u548c\u968f\u60f3"],
    ["zh", "section.recently.viewAll", "\u67e5\u770b\u5168\u90e8\u52a8\u6001"],

    // Blog / Posts
    ["zh", "blog.readMore", "\u9605\u8bfb\u66f4\u591a"],
    ["zh", "blog.back", "\u8fd4\u56de\u6587\u7ae0\u5217\u8868"],
    ["zh", "blog.empty", "\u6682\u65e0\u6587\u7ae0\u3002"],
    ["zh", "blog.category", "\u5206\u7c7b"],
    ["zh", "blog.publishedAt", "\u53d1\u5e03\u4e8e"],
    ["zh", "blog.updatedAt", "\u66f4\u65b0\u4e8e"],
    ["zh", "blog.minRead", "\u5206\u949f\u9605\u8bfb"],
    ["zh", "blog.toc", "\u76ee\u5f55"],
    ["zh", "blog.share", "\u5206\u4eab\u8fd9\u7bc7\u6587\u7ae0"],
    ["zh", "blog.relatedPosts", "\u76f8\u5173\u6587\u7ae0"],

    // Notes
    ["zh", "notes.empty", "\u6682\u65e0\u624b\u8bb0\u3002"],
    ["zh", "notes.back", "\u8fd4\u56de\u624b\u8bb0\u5217\u8868"],
    ["zh", "notes.writtenOn", "\u8bb0\u5f55\u4e8e"],

    // Recently / Thoughts
    ["zh", "recently.empty", "\u6682\u65e0\u52a8\u6001\u3002"],
    ["zh", "recently.justNow", "\u521a\u521a"],
    ["zh", "recently.minutesAgo", "\u5206\u949f\u524d"],
    ["zh", "recently.hoursAgo", "\u5c0f\u65f6\u524d"],
    ["zh", "recently.daysAgo", "\u5929\u524d"],
    ["zh", "recently.weeksAgo", "\u5468\u524d"],

    // About
    ["zh", "about.title", "\u5173\u4e8e\u6211"],
    ["zh", "about.content", "\u6211\u662f\u4e00\u540d\u70ed\u8877\u4e8e\u6784\u5efa\u7cbe\u7f8e Web \u4f53\u9a8c\u7684\u5f00\u53d1\u8005\u3002\u6211\u64b0\u5199\u5173\u4e8e\u6280\u672f\u3001\u8bbe\u8ba1\u601d\u7ef4\u4ee5\u53ca\u4ee3\u7801\u4e0e\u521b\u610f\u4ea4\u6c47\u70b9\u7684\u6587\u7ae0\u3002"],
    ["zh", "about.skills", "\u6280\u80fd"],
    ["zh", "about.experience", "\u7ecf\u5386"],
    ["zh", "about.contact", "\u8054\u7cfb\u6211"],
    ["zh", "about.socialLinks", "\u5728\u8fd9\u91cc\u627e\u5230\u6211"],

    // Footer
    ["zh", "footer.copyright", "\u4fdd\u7559\u6240\u6709\u6743\u5229\u3002"],
    ["zh", "footer.powered", "\u6280\u672f\u9a71\u52a8"],
    ["zh", "footer.builtWith", "\u4f7f\u7528 Next.js & Koa \u6784\u5efa"],

    // Common
    ["zh", "common.loading", "\u52a0\u8f7d\u4e2d..."],
    ["zh", "common.error", "\u51fa\u4e86\u70b9\u95ee\u9898"],
    ["zh", "common.retry", "\u91cd\u8bd5"],
    ["zh", "common.notFound", "\u9875\u9762\u672a\u627e\u5230"],
    ["zh", "common.notFound.desc", "\u4f60\u8bbf\u95ee\u7684\u9875\u9762\u4e0d\u5b58\u5728\u3002"],
    ["zh", "common.backHome", "\u8fd4\u56de\u9996\u9875"],
    ["zh", "common.search", "\u641c\u7d22"],
    ["zh", "common.search.placeholder", "\u641c\u7d22\u6587\u7ae0\u3001\u624b\u8bb0..."],
    ["zh", "common.noResults", "\u672a\u627e\u5230\u7ed3\u679c"],

    // Theme
    ["zh", "theme.light", "\u6d45\u8272\u6a21\u5f0f"],
    ["zh", "theme.dark", "\u6df1\u8272\u6a21\u5f0f"],
    ["zh", "theme.system", "\u8ddf\u968f\u7cfb\u7edf"],

    // Language
    ["zh", "lang.switch", "\u8bed\u8a00"],
    ["zh", "lang.en", "\u82f1\u6587"],
    ["zh", "lang.zh", "\u4e2d\u6587"],

    // Admin
    ["zh", "admin.login", "\u7ba1\u7406\u5458\u767b\u5f55"],
    ["zh", "admin.loginDesc", "\u767b\u5f55\u4ee5\u7ba1\u7406\u4f60\u7684\u535a\u5ba2"],
    ["zh", "admin.username", "\u7528\u6237\u540d"],
    ["zh", "admin.password", "\u5bc6\u7801"],
    ["zh", "admin.signIn", "\u767b\u5f55"],
    ["zh", "admin.dashboard", "\u63a7\u5236\u53f0"],
    ["zh", "admin.welcome", "\u6b22\u8fce"],
    ["zh", "admin.logout", "\u9000\u51fa"],
    ["zh", "admin.articles", "\u6587\u7ae0"],
    ["zh", "admin.recently", "\u788e\u788e\u5ff5"],
    ["zh", "admin.categories", "\u5206\u7c7b\u7ba1\u7406"],
    ["zh", "category.all", "\u5168\u90e8"],

    // Time
    ["zh", "time.year", "\u5e74"],
    ["zh", "time.years", "\u5e74"],
    ["zh", "time.month", "\u6708"],
    ["zh", "time.months", "\u6708"],
    ["zh", "time.day", "\u5929"],
    ["zh", "time.days", "\u5929"],
    ["zh", "time.ago", "\u524d"],
    ["zh", "time.today", "\u4eca\u5929"],
    ["zh", "time.yesterday", "\u6628\u5929"],
  ]

  for (const [lang, key, value] of labels) {
    database.run("INSERT OR IGNORE INTO i18n_labels (lang, key, value) VALUES (?, ?, ?)", [lang, key, value])
  }

  // Categories
  const now = new Date().toISOString()
  const defaultCategories = [
    { slug: "tech", name_en: "Technology", name_zh: "\u6280\u672f", sort_order: 1 },
    { slug: "life", name_en: "Life", name_zh: "\u751f\u6d3b", sort_order: 2 },
    { slug: "dev", name_en: "Development", name_zh: "\u5f00\u53d1", sort_order: 3 },
    { slug: "design", name_en: "Design", name_zh: "\u8bbe\u8ba1", sort_order: 4 },
  ]
  for (const cat of defaultCategories) {
    database.run(
      "INSERT INTO categories (slug, name_en, name_zh, sort_order, created_at) VALUES (?, ?, ?, ?, ?)",
      [cat.slug, cat.name_en, cat.name_zh, cat.sort_order, now]
    )
  }

  // Posts
  const posts = [
    {
      slug: "hello-world",
      category: "dev",
      translations: [
        { lang: "en", title: "Hello World", summary: "My first blog post about my journey into web development.", content: "# Hello World\n\nWelcome to my blog! This is my first post.\n\nI've been building websites for over five years now, and I finally decided to start writing about my experiences. In this blog, you'll find posts about:\n\n- **Web Development** - Tips, tricks, and best practices\n- **Design Thinking** - How I approach UI/UX design\n- **Life as a Developer** - The human side of coding\n\nStay tuned for more content!\n\n## Why Start a Blog?\n\nWriting helps me organize my thoughts and deepen my understanding of complex topics. If my posts help even one person, that's a win.\n\nThanks for reading!" },
        { lang: "zh", title: "\u4f60\u597d\uff0c\u4e16\u754c", summary: "\u6211\u7684\u7b2c\u4e00\u7bc7\u535a\u5ba2\u6587\u7ae0\uff0c\u5206\u4eab\u6211\u8fdb\u5165 Web \u5f00\u53d1\u4e16\u754c\u7684\u65c5\u7a0b\u3002", content: "# \u4f60\u597d\uff0c\u4e16\u754c\n\n\u6b22\u8fce\u6765\u5230\u6211\u7684\u535a\u5ba2\uff01\u8fd9\u662f\u6211\u7684\u7b2c\u4e00\u7bc7\u6587\u7ae0\u3002\n\n\u6211\u4ece\u4e8b\u7f51\u7ad9\u5f00\u53d1\u5df2\u7ecf\u8d85\u8fc7\u4e94\u5e74\u4e86\uff0c\u7ec8\u4e8e\u51b3\u5b9a\u5f00\u59cb\u8bb0\u5f55\u6211\u7684\u7ecf\u9a8c\u3002\n\n- **Web \u5f00\u53d1** - \u6280\u5de7\u3001\u7a8d\u95e8\u548c\u6700\u4f73\u5b9e\u8df5\n- **\u8bbe\u8ba1\u601d\u7ef4** - \u6211\u5982\u4f55\u5904\u7406 UI/UX \u8bbe\u8ba1\n- **\u5f00\u53d1\u8005\u7684\u751f\u6d3b** - \u7f16\u7a0b\u7684\u4eba\u6587\u9762\n\n\u656c\u8bf7\u671f\u5f85\u66f4\u591a\u5185\u5bb9\uff01\n\n## \u4e3a\u4ec0\u4e48\u5f00\u59cb\u5199\u535a\u5ba2\uff1f\n\n\u5199\u4f5c\u5e2e\u52a9\u6211\u6574\u7406\u601d\u8def\uff0c\u52a0\u6df1\u5bf9\u590d\u6742\u4e3b\u9898\u7684\u7406\u89e3\u3002\n\n\u611f\u8c22\u9605\u8bfb\uff01" },
      ],
    },
    {
      slug: "building-with-nextjs",
      category: "dev",
      translations: [
        { lang: "en", title: "Building Modern Apps with Next.js", summary: "An exploration of Next.js features and why it's my go-to framework.", content: "# Building Modern Apps with Next.js\n\nNext.js has transformed the way I build web applications.\n\n## Server Components\n\nReact Server Components allow us to render on the server, reducing client JavaScript.\n\n## The App Router\n\nNested layouts, loading states, and error boundaries make complex applications simpler.\n\n## Key Benefits\n\n1. **Performance** - Automatic code splitting\n2. **Developer Experience** - Hot reload and TypeScript support\n3. **Flexibility** - Static, server-rendered, or hybrid\n4. **Ecosystem** - Rich plugin ecosystem" },
        { lang: "zh", title: "\u7528 Next.js \u6784\u5efa\u73b0\u4ee3\u5e94\u7528", summary: "\u63a2\u7d22 Next.js \u7684\u7279\u6027\uff0c\u4ee5\u53ca\u5b83\u6210\u4e3a\u6211\u9996\u9009\u6846\u67b6\u7684\u539f\u56e0\u3002", content: "# \u7528 Next.js \u6784\u5efa\u73b0\u4ee3\u5e94\u7528\n\nNext.js \u6539\u53d8\u4e86\u6211\u6784\u5efa Web \u5e94\u7528\u7684\u65b9\u5f0f\u3002\n\n## \u670d\u52a1\u7aef\u7ec4\u4ef6\n\nReact \u670d\u52a1\u7aef\u7ec4\u4ef6\u5141\u8bb8\u6211\u4eec\u5728\u670d\u52a1\u5668\u4e0a\u6e32\u67d3\uff0c\u51cf\u5c11\u5ba2\u6237\u7aef JavaScript\u3002\n\n## App Router\n\n\u5d4c\u5957\u5e03\u5c40\u3001\u52a0\u8f7d\u72b6\u6001\u548c\u9519\u8bef\u8fb9\u754c\u4f7f\u590d\u6742\u5e94\u7528\u66f4\u7b80\u5355\u3002\n\n## \u4e3b\u8981\u4f18\u52bf\n\n1. **\u6027\u80fd** - \u81ea\u52a8\u4ee3\u7801\u5206\u5272\n2. **\u5f00\u53d1\u4f53\u9a8c** - \u70ed\u91cd\u8f7d\u548c TypeScript \u652f\u6301\n3. **\u7075\u6d3b\u6027** - \u9759\u6001\u3001\u670d\u52a1\u7aef\u6e32\u67d3\u6216\u6df7\u5408\n4. **\u751f\u6001\u7cfb\u7edf** - \u4e30\u5bcc\u7684\u63d2\u4ef6\u751f\u6001" },
      ],
    },
    {
      slug: "design-principles",
      category: "design",
      translations: [
        { lang: "en", title: "Design Principles I Live By", summary: "Core design principles that guide my work as a developer.", content: "# Design Principles I Live By\n\n## 1. Simplicity First\n\nStrip away everything unnecessary until only the essential remains.\n\n## 2. Typography Matters\n\nGood typography can make or break a design.\n\n## 3. Whitespace is Your Friend\n\nIt gives content room to breathe.\n\n## 4. Consistency Creates Trust\n\nConsistent spacing, colors, and interactions build reliability.\n\n## 5. Accessible by Default\n\nEvery design should be usable by everyone." },
        { lang: "zh", title: "\u6211\u9075\u5faa\u7684\u8bbe\u8ba1\u539f\u5219", summary: "\u6307\u5bfc\u6211\u5de5\u4f5c\u7684\u6838\u5fc3\u8bbe\u8ba1\u539f\u5219\u3002", content: "# \u6211\u9075\u5faa\u7684\u8bbe\u8ba1\u539f\u5219\n\n## 1. \u7b80\u7ea6\u4f18\u5148\n\n\u53bb\u9664\u6240\u6709\u4e0d\u5fc5\u8981\u7684\u5143\u7d20\uff0c\u76f4\u5230\u53ea\u5269\u4e0b\u672c\u8d28\u3002\n\n## 2. \u6392\u7248\u5f88\u91cd\u8981\n\n\u597d\u7684\u6392\u7248\u53ef\u4ee5\u6210\u5c31\u6216\u6bc1\u6389\u4e00\u4e2a\u8bbe\u8ba1\u3002\n\n## 3. \u7559\u767d\u662f\u670b\u53cb\n\n\u5b83\u7ed9\u5185\u5bb9\u547c\u5438\u7684\u7a7a\u95f4\u3002\n\n## 4. \u4e00\u81f4\u6027\u5efa\u7acb\u4fe1\u4efb\n\n\u4e00\u81f4\u7684\u95f4\u8ddd\u3001\u989c\u8272\u548c\u4ea4\u4e92\u5efa\u7acb\u53ef\u9760\u611f\u3002\n\n## 5. \u9ed8\u8ba4\u53ef\u8bbf\u95ee\n\n\u6bcf\u4e2a\u8bbe\u8ba1\u90fd\u5e94\u5bf9\u6240\u6709\u4eba\u53ef\u7528\u3002" },
      ],
    },
    {
      slug: "from-sillytavern-to-api",
      category: "tech",
      translations: [
        { lang: "en", title: "From SillyTavern Setup to API: A Complete Guide", summary: "A comprehensive tutorial on setting up SillyTavern and obtaining API access.", content: "# From SillyTavern Setup to API\n\nA step-by-step guide to getting started with SillyTavern and connecting it to various AI APIs.\n\n## Prerequisites\n\nBefore we begin, make sure you have Node.js installed on your system.\n\n## Installation\n\n1. Clone the repository\n2. Install dependencies\n3. Configure your API keys\n\n## Configuration\n\nThe configuration file allows you to set up multiple API endpoints and customize the behavior of the application." },
        { lang: "zh", title: "\u4ece SillyTavern \u642d\u5efa\u5230 API \u83b7\u53d6\u5168\u653b\u7565", summary: "\u4e00\u4efd\u5173\u4e8e\u642d\u5efa SillyTavern \u5e76\u83b7\u53d6 API \u8bbf\u95ee\u7684\u5b8c\u6574\u6559\u7a0b\u3002", content: "# \u4ece SillyTavern \u642d\u5efa\u5230 API \u83b7\u53d6\n\n\u4e00\u4e2a\u5173\u4e8e\u5f00\u59cb\u4f7f\u7528 SillyTavern \u5e76\u8fde\u63a5\u5404\u79cd AI API \u7684\u5206\u6b65\u6307\u5357\u3002\n\n## \u524d\u63d0\u6761\u4ef6\n\n\u5728\u5f00\u59cb\u4e4b\u524d\uff0c\u786e\u4fdd\u4f60\u7684\u7cfb\u7edf\u5df2\u5b89\u88c5 Node.js\u3002\n\n## \u5b89\u88c5\n\n1. \u514b\u9686\u4ed3\u5e93\n2. \u5b89\u88c5\u4f9d\u8d56\n3. \u914d\u7f6e API \u5bc6\u94a5\n\n## \u914d\u7f6e\n\n\u914d\u7f6e\u6587\u4ef6\u5141\u8bb8\u4f60\u8bbe\u7f6e\u591a\u4e2a API \u7aef\u70b9\u5e76\u81ea\u5b9a\u4e49\u5e94\u7528\u884c\u4e3a\u3002" },
      ],
    },
    {
      slug: "why-sse-for-realtime",
      category: "dev",
      translations: [
        { lang: "en", title: "Why I Chose Server-Sent Events for Real-Time Features", summary: "Exploring why SSE became the ideal choice over WebSockets for real-time updates.", content: "# Why I Chose Server-Sent Events\n\nWhen building real-time features, developers often reach for WebSockets. But for my use case, Server-Sent Events (SSE) proved to be the better choice.\n\n## The Problem\n\nI needed a way to push updates from the server to the client in real-time.\n\n## Why Not WebSockets?\n\nWebSockets are bidirectional, but I only needed server-to-client communication. SSE is simpler, uses standard HTTP, and automatically handles reconnection.\n\n## Implementation\n\nSSE integrates beautifully with existing HTTP infrastructure and requires minimal code on both ends." },
        { lang: "zh", title: "\u4e3a\u4ec0\u4e48\u6700\u540e\u8fd8\u662f\u4f7f\u7528\u4e86 SSE \u6765\u5b9e\u73b0\u5373\u65f6\u52a8\u6001", summary: "\u63a2\u7d22\u4e3a\u4ec0\u4e48 SSE \u6210\u4e3a\u5b9e\u65f6\u66f4\u65b0\u7684\u7406\u60f3\u9009\u62e9\u3002", content: "# \u4e3a\u4ec0\u4e48\u9009\u62e9 Server-Sent Events\n\n\u5728\u6784\u5efa\u5b9e\u65f6\u529f\u80fd\u65f6\uff0c\u5f00\u53d1\u8005\u901a\u5e38\u4f1a\u9009\u62e9 WebSocket\u3002\u4f46\u5bf9\u4e8e\u6211\u7684\u573a\u666f\uff0cSSE \u662f\u66f4\u597d\u7684\u9009\u62e9\u3002\n\n## \u95ee\u9898\n\n\u6211\u9700\u8981\u4ece\u670d\u52a1\u5668\u5411\u5ba2\u6237\u7aef\u5b9e\u65f6\u63a8\u9001\u66f4\u65b0\u3002\n\n## \u4e3a\u4ec0\u4e48\u4e0d\u7528 WebSocket\uff1f\n\nWebSocket \u662f\u53cc\u5411\u7684\uff0c\u4f46\u6211\u53ea\u9700\u8981\u670d\u52a1\u5668\u5230\u5ba2\u6237\u7aef\u7684\u901a\u4fe1\u3002SSE \u66f4\u7b80\u5355\uff0c\u4f7f\u7528\u6807\u51c6 HTTP\uff0c\u5e76\u81ea\u52a8\u5904\u7406\u91cd\u8fde\u3002\n\n## \u5b9e\u73b0\n\nSSE \u4e0e\u73b0\u6709 HTTP \u57fa\u7840\u8bbe\u65bd\u5b8c\u7f8e\u96c6\u6210\uff0c\u4e24\u7aef\u53ea\u9700\u6781\u5c11\u4ee3\u7801\u3002" },
      ],
    },
  ]

  for (const post of posts) {
    database.run(
      "INSERT INTO posts (slug, category, cover_image, created_at, updated_at) VALUES (?, ?, NULL, ?, ?)",
      [post.slug, post.category, now, now]
    )
    const result = database.exec("SELECT last_insert_rowid() as id")
    const postId = result[0]?.values[0]?.[0] as number

    for (const t of post.translations) {
      database.run(
        "INSERT INTO post_translations (post_id, lang, title, summary, content) VALUES (?, ?, ?, ?, ?)",
        [postId, t.lang, t.title, t.summary, t.content]
      )
    }
  }

  // Notes
  const noteData = [
    { nid: 1, en: { title: "Trying out the new code highlighting", content: "Today I experimented with Shiki for code highlighting. The dual-theme support for light and dark mode is incredible. It makes code blocks look so much more polished compared to Prism.js." }, zh: { title: "\u5c1d\u8bd5\u65b0\u7684\u4ee3\u7801\u9ad8\u4eae\u65b9\u6848", content: "\u4eca\u5929\u6211\u5c1d\u8bd5\u4e86 Shiki \u4ee3\u7801\u9ad8\u4eae\u3002\u6df1\u6d45\u4e3b\u9898\u7684\u53cc\u4e3b\u9898\u652f\u6301\u592a\u68d2\u4e86\u3002\u76f8\u6bd4 Prism.js\uff0c\u4ee3\u7801\u5757\u770b\u8d77\u6765\u66f4\u52a0\u7cbe\u81f4\u3002" } },
    { nid: 2, en: { title: "Notes on English class", content: "Some notes from today's English class on advanced grammar patterns. The conditional perfect tense is trickier than I thought." }, zh: { title: "\u82f1\u8bed\u8bfe\u5802\u7b14\u8bb0", content: "\u4eca\u5929\u82f1\u8bed\u8bfe\u4e0a\u5173\u4e8e\u9ad8\u7ea7\u8bed\u6cd5\u6a21\u5f0f\u7684\u4e00\u4e9b\u7b14\u8bb0\u3002\u6761\u4ef6\u5b8c\u6210\u65f6\u6bd4\u6211\u60f3\u8c61\u7684\u8981\u590d\u6742\u3002" } },
    { nid: 3, en: { title: "Conic sections and curves", content: "Working through exercises on parabolas, ellipses, and hyperbolas. The geometric proofs are elegant but require careful attention to detail." }, zh: { title: "\u5706\u9525\u66f2\u7ebf\u7b14\u8bb0", content: "\u7ec3\u4e60\u629b\u7269\u7ebf\u3001\u692d\u5706\u548c\u53cc\u66f2\u7ebf\u7684\u9898\u76ee\u3002\u51e0\u4f55\u8bc1\u660e\u5f88\u4f18\u96c5\uff0c\u4f46\u9700\u8981\u7ec6\u5fc3\u3002" } },
  ]

  for (const note of noteData) {
    const d = new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString()
    database.run("INSERT INTO notes (nid, created_at) VALUES (?, ?)", [note.nid, d])
    const result = database.exec("SELECT last_insert_rowid() as id")
    const noteId = result[0]?.values[0]?.[0] as number
    database.run("INSERT INTO note_translations (note_id, lang, title, content) VALUES (?, ?, ?, ?)", [noteId, "en", note.en.title, note.en.content])
    database.run("INSERT INTO note_translations (note_id, lang, title, content) VALUES (?, ?, ?, ?)", [noteId, "zh", note.zh.title, note.zh.content])
  }

  // Recently / Thoughts
  const thoughts = [
    { content: "Working through SolidStart has been a wild ride. Retreated back to Next.js for now.", created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { content: "The more I look at the source code, the more I appreciate good architecture. Clean abstractions matter.", created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { content: "Sometimes the best debugging tool is a good night's sleep. Fresh eyes see bugs faster.", created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
    { content: "Just deployed my new blog stack. The glassmorphism design turned out better than expected.", created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
  ]

  for (const t of thoughts) {
    database.run("INSERT INTO recently (content, created_at) VALUES (?, ?)", [t.content, t.created_at])
  }
}
