import { sql } from "@vercel/postgres";

async function verifyData() {
  try {
    console.log("Checking newsletter categories...");
    const categoriesResult = await sql`
      SELECT COUNT(*) as count FROM newsletter_categories
    `;
    console.log("Categories count:", categoriesResult.rows[0]);

    console.log("\nChecking newsletter articles...");
    const articlesResult = await sql`
      SELECT COUNT(*) as count FROM newsletter_articles
    `;
    console.log("Articles count:", articlesResult.rows[0]);

    console.log("\nFetching first article with category...");
    const articleResult = await sql`
      SELECT 
        na.id,
        na.title,
        na.status,
        nc.name as category_name
      FROM newsletter_articles na
      LEFT JOIN newsletter_categories nc ON na.category_id = nc.id
      LIMIT 1
    `;
    console.log("First article:", articleResult.rows[0]);

  } catch (error) {
    console.error("Error:", error);
  }
}

verifyData();
