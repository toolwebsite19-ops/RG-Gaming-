import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Initialize Firebase for the server
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for JSON
  app.use(express.json());
  
  // Trust proxy to get correct host and protocol from load balancer
  app.set('trust proxy', true);

  // Dynamic Sitemap Generator
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Static routes
      const staticRoutes = ['/', '/latest', '/categories', '/about'];
      for (const route of staticRoutes) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${route}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
        xml += `  </url>\n`;
      }
      
      // Dynamic posts
      postsSnapshot.forEach(doc => {
        const post = doc.data();
        if (post.slug) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/post/${post.slug}</loc>\n`;
          const date = post.createdAt?.toDate ? post.createdAt.toDate().toISOString() : new Date().toISOString();
          xml += `    <lastmod>${date}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.9</priority>\n`;
          xml += `  </url>\n`;
        }
      });
      
      xml += `</urlset>`;
      
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).end();
    }
  });

  // API Route for sending OneSignal notifications
  app.post("/api/notifications/send", async (req, res) => {
    const { title, url, content } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
    const appId = "c9157d14-9695-46be-b5bd-dcdd0e444560"; // The app ID from the setup
    
    if (!restApiKey) {
      console.warn("ONESIGNAL_REST_API_KEY not configured. Skipping push notification.");
      return res.status(500).json({ error: "OneSignal REST API Key is missing on the server." });
    }

    try {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${restApiKey}`,
        },
        body: JSON.stringify({
          app_id: appId,
          included_segments: ["Subscribed Users", "Active Users", "Total Subscriptions"],
          headings: { en: title },
          contents: { en: content || "Check out our latest post!" },
          url: url,
        }),
      });

      const data = await response.json();
      console.log("OneSignal API response:", data);
      
      if (!response.ok) {
        throw new Error(data.errors ? data.errors.join(", ") : "Failed to send notification");
      }

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Error sending OneSignal notification:", error);
      res.status(500).json({ error: error.message || "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
