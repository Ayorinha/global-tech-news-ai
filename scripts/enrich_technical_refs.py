"""AyoraiTech — valida referências técnicas antes de exibi-las.

Não cria links genéricos. Só adiciona Hugging Face/GitHub quando uma
entidade técnica é identificada em contexto técnico e a referência oficial
é confirmada pela API correspondente.
"""

import json
import re
from pathlib import Path

import requests

ROOT = Path(__file__).parent.parent
NEWS_FILE = ROOT / "data" / "news.json"

HEADERS = {"User-Agent": "AyoraiTech-News/1.0"}

# O nome da empresa sozinho não basta. A notícia também precisa mencionar
# um artefato técnico: modelo, SDK, API, biblioteca, código, repo etc.
TECHNICAL_CONTEXT = re.compile(r"""
\b(?:model|modelo|llm|language model|foundation model|weights|checkpoint|
    dataset|benchmark|sdk|api|library|biblioteca|framework|software|code|
    código|codigo|repository|repo|repositor|github|open source|opensource|
    developer|developers|development|desenvolvimento|package|pacote|tool|
    ferramenta|agent|agente|inference|inferência|fine[- ]?tuning|training|
    treinamento|release|released|lança|lancamento|versão|version|v\d|plugin|
    extension|extensão|hugging face|transformers|pytorch|tensorflow|rag|
    embedding|multimodal|computer vision|nlp|ocr
)\b
""", re.I | re.X)

GITHUB_REFS = [
    (r"\bopenai\b|\bgpt[- ]?[345]\b|\bchatgpt\b", "openai/openai-python"),
    (r"\banthropic\b|\bclaude\b", "anthropics/anthropic-sdk-python"),
    (r"\bllama(?: 3(?:\.1|\.2|\.3)?| 4)?\b|\bmeta llama\b", "meta-llama/llama-models"),
    (r"\bqwen(?:2|2\.5|3)?\b", "QwenLM/Qwen"),
    (r"\bdeepseek\b", "deepseek-ai/DeepSeek-V3"),
    (r"\bgemma(?: 2| 3)?\b", "google-deepmind/gemma"),
    (r"\btransformers\b|\bhugging ?face\b", "huggingface/transformers"),
    (r"\blangchain\b", "langchain-ai/langchain"),
    (r"\bautogen\b", "microsoft/autogen"),
    (r"\bsemantic kernel\b", "microsoft/semantic-kernel"),
]

HF_REFS = [
    (r"\bllama 3\.1 8b(?: instruct)?\b", "meta-llama/Llama-3.1-8B-Instruct"),
    (r"\bllama 3\.2 3b(?: instruct)?\b", "meta-llama/Llama-3.2-3B-Instruct"),
    (r"\bqwen3[- ]8b\b", "Qwen/Qwen3-8B"),
    (r"\bqwen2\.5[- ]7b\b", "Qwen/Qwen2.5-7B-Instruct"),
    (r"\bdeepseek[- ]v3\b", "deepseek-ai/DeepSeek-V3"),
    (r"\bgemma[- ]3[- ]27b\b", "google/gemma-3-27b-it"),
    (r"\bphi[- ]4\b", "microsoft/phi-4"),
    (r"\bmistral[- ]7b[- ]instruct\b", "mistralai/Mistral-7B-Instruct-v0.3"),
]


def text(article):
    return " ".join(str(article.get(k, "")) for k in (
        "title_original", "title_pt", "description_original", "description_pt"
    )).lower()


def github_exists(repo):
    try:
        r = requests.get(f"https://api.github.com/repos/{repo}", headers=HEADERS, timeout=10)
        return r.status_code == 200
    except requests.RequestException:
        return False


def hf_exists(repo):
    try:
        r = requests.get(f"https://huggingface.co/api/models/{repo}", headers=HEADERS, timeout=10)
        return r.status_code == 200
    except requests.RequestException:
        return False


def find_ref(patterns, value, checker):
    for pattern, repo in patterns:
        if re.search(pattern, value, flags=re.I) and checker(repo):
            return repo
    return ""


def main():
    with NEWS_FILE.open("r", encoding="utf-8") as f:
        articles = json.load(f)

    technical = 0
    hf_count = 0
    gh_count = 0

    for article in articles:
        value = text(article)

        # Sem contexto técnico explícito, não há busca nem link para HF/GitHub.
        if not TECHNICAL_CONTEXT.search(value):
            article.pop("technical_refs", None)
            continue

        github_repo = find_ref(GITHUB_REFS, value, github_exists)
        hf_repo = find_ref(HF_REFS, value, hf_exists)

        refs = {}
        if github_repo:
            refs["github"] = {
                "url": f"https://github.com/{github_repo}",
                "repository": github_repo,
            }
            gh_count += 1
        if hf_repo:
            refs["huggingface"] = {
                "url": f"https://huggingface.co/{hf_repo}",
                "model": hf_repo,
            }
            hf_count += 1

        if refs:
            technical += 1
            article["technical_refs"] = refs
        else:
            article.pop("technical_refs", None)

    with NEWS_FILE.open("w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"Referências técnicas: {technical}")
    print(f"Hugging Face confirmados: {hf_count}")
    print(f"GitHub confirmados: {gh_count}")


if __name__ == "__main__":
    main()
