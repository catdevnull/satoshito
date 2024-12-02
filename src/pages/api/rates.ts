import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const response = await fetch("https://criptoya.com/api/btc/ars");
    const data = await response.json();

    // Filter out the time field and transform data
    const exchanges = Object.entries(data)
      .filter(([key]) => key !== "time")
      .map(([exchange, values]: [string, any]) => ({
        exchange,
        price: values.ask,
      }));

    const avgRate =
      exchanges.reduce((a, b) => a + b.price, 0) / exchanges.length;

    return new Response(
      JSON.stringify({
        rate: avgRate,
        exchanges,
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
