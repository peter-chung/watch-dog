from bs4 import BeautifulSoup


def extract_content(html: str, selector: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    element = soup.select_one(selector)

    if element is None:
        if selector.strip().lower() == "body":
            text = soup.get_text(separator=" ", strip=True)
        else:
            raise ValueError("No element found for the provided selector.")
    else:
        text = element.get_text(separator=" ", strip=True)

    if not text:
        raise ValueError("The selected element contains no text.")

    normalized = " ".join(text.split())

    return normalized
