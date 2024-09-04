import { ExtensionSimilaritySearch } from "../azure-ai-search/azure-ai-search";
import { CreateCitations, FormatCitations } from "../citation-service";

export const SearchAzureAISimilarDocuments = async (req: Request) => {
  try {
    const body = await req.json();
    const search = body.search as string;

    const vectors = req.headers.get("text_vector") as string;
    const apiKey = req.headers.get("apiKey") as string;
    const searchName = req.headers.get("searchName") as string;
    const indexName = req.headers.get("indexName") as string;
    const userId = req.headers.get("authorization") as string;

    console.log("Received request with the following parameters:");
    console.log("search:", search);
    console.log("vectors:", vectors);
    console.log("apiKey:", apiKey ? "Provided" : "Missing");
    console.log("searchName:", searchName);
    console.log("indexName:", indexName);
    console.log("userId:", userId);

    const result = await ExtensionSimilaritySearch({
      apiKey,
      searchName,
      indexName,
      vectors: vectors.split(","),
      searchText: search,
    });

    if (result.status !== "OK") {
      console.error("🔴 Error retrieving documents:", result.errors);
      return new Response(JSON.stringify(result), { status: 403 });
    }

    console.log("Documents retrieved successfully:", result.response);

    const withoutEmbedding = FormatCitations(result.response);
    const citationResponse = await CreateCitations(withoutEmbedding, userId);

    const allCitations = citationResponse
      .filter(citation => citation.status === "OK")
      .map(citation => ({
        id: citation.response.id,
        content: citation.response.content,
      }));

    return new Response(JSON.stringify(allCitations));
  } catch (e) {
    console.error("🔴 Error during document retrieval:", e);
    return new Response(JSON.stringify({ error: e }), { status: 500 });
  }
};
