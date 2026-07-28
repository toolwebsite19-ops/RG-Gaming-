import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function generateSitemap() {
  try {
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    const baseUrl = 'https://rggaming.netlify.app';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    const staticRoutes = ['/', '/latest', '/categories', '/about'];
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    }
    
    postsSnapshot.forEach(doc => {
      const post = doc.data();
      if (post.slug) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/post/${post.slug}</loc>\n`;
        let dateStr = new Date().toISOString();
        if (post.createdAt && typeof post.createdAt.toDate === 'function') {
           dateStr = post.createdAt.toDate().toISOString();
        } else if (post.createdAt && post.createdAt.seconds) {
           dateStr = new Date(post.createdAt.seconds * 1000).toISOString();
        }
        xml += `    <lastmod>${dateStr}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    });
    
    xml += `</urlset>`;
    
    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('Sitemap generated successfully in public/sitemap.xml!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
