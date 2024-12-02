import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const response = await fetch("https://criptoya.com/api/btc/ars");
    const data = await response.json();

    // Calculate average rate excluding outliers
    const rates = Object.entries(data)
      .filter(([key]) => !["time"].includes(key))
      .map(([_, values]: [string, any]) => values.ask);

    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;

    return new Response(
      JSON.stringify({
        rate: avgRate,
        time: new Date().getTime(),
        satsPerPeso: (100000000 / avgRate).toFixed(2),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching rates" }), {
      status: 500,
    });
  }
};
