export async function GET(request: Request ) {
    const { searchParams: params } = new URL(request.url);
    const prompt = params.get("prompt");

    if (!prompt) {
        return getResponse({ error: "No prompt given" }, 500);
    }

    const response = await fetch("https://askmybook.com/ask", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://askmybook.com/",
        // P.S. Not sure if generating a new token is necessary
        "body": `csrfmiddlewaretoken=${generateRandomToken()}&question=${prompt}`,
        "method": "POST",
        "mode": "cors"
    })
    .then(response => response.json())
    .catch(() => {});

    if (response && response.answer) {
        return getResponse({ answer: response.answer }, 200);
    }

    return getResponse({ error: "Something went wrong" },
        200
    );
}

function getResponse(json: Object, statusCode: number): Response {
    return new Response(JSON.stringify(json), { status: statusCode });
}

function generateRandomToken() {
    let alpha = "abcdefghijklmnopqrstuvwxyz";
    alpha += alpha.toUpperCase();
    alpha += "1234567890"

    const alphaLength = alpha.length;
    let output = "";

    for (let i = 0; i < 64; i++) {
        output += alpha.charAt(Math.floor(Math.random() * alphaLength))
    }

    return output;
}