import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    
    if (!token) {
      return new Response("Missing token parameter", { status: 400 });
    }
    
    // Get the prompt directly instead of using share token
    // This is a fallback since the PromptShare model has been removed
    const promptId = token; // Assuming token is now the prompt ID
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        categories: {
          take: 1,
          select: {
            category: {
              select: {
                nameEn: true,
              }
            }
          }
        },
        tools: {
          select: {
            tool: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!prompt) {
      return new Response("Prompt not found", { status: 404 });
    }
    
    // Extract prompt data
    const title = prompt.titleEn;
    const description = prompt.descriptionEn || "";
    const category = prompt.categories[0]?.category.nameEn || "";
    const tools = prompt.tools.map((t: { tool: { name: string } }) => t.tool.name).join(", ");
    
    // Use system fonts instead of loading custom fonts
    // This avoids issues with font file paths
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            width: "100%",
            height: "100%",
            padding: "40px",
            backgroundColor: "#020613", // black-main
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Promptaat Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                background: "linear-gradient(to right, #9333EA, #4F46E5)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Promptaat
            </div>
          </div>
          
          {/* Title */}
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              margin: "0 0 20px 0",
              maxWidth: "80%",
            }}
          >
            {title}
          </h1>
          
          {/* Description */}
          <p
            style={{
              fontSize: "24px",
              margin: "0 0 30px 0",
              color: "#94A3B8", // light-grey
              maxWidth: "80%",
              lineHeight: 1.4,
            }}
          >
            {description.length > 120 ? `${description.substring(0, 120)}...` : description}
          </p>
          
          {/* Category & Tools */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "auto",
            }}
          >
            {category && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                }}
              >
                <span style={{ color: "#94A3B8" }}>Category:</span>
                <span>{category}</span>
              </div>
            )}
            
            {tools && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                }}
              >
                <span style={{ color: "#94A3B8" }}>Tools:</span>
                <span>{tools}</span>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
