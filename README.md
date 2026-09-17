# Ayorai Global Tech News AI

> Applied AI · Data · Intelligent Automation — technical portfolio and automated technology-news pipeline.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/) [![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions) [![RSS](https://img.shields.io/badge/Data-RSS%20Feeds-orange)](https://www.rssboard.org/rss-specification)

## Overview

Ayorai Global Tech News AI is a lightweight automated pipeline that collects technology news from multiple RSS sources, extracts available metadata and images, translates supported content to Portuguese, and publishes a browser-based experience through GitHub Pages.

The repository also acts as the public technical showcase for the Ayorai portfolio, connecting the live application with selected projects in data, machine learning, document intelligence and automation.

## Architecture

```text
RSS Sources
    │
    ▼
Python Ingestion
    │
    ├── Feed parsing
    ├── Metadata extraction
    ├── Image discovery
    └── Translation
    │
    ▼
data/news.json
    │
    ▼
Static Web Application
    │
    ├── News discovery
    ├── Search / filters
    └── Ayorai portfolio
    │
    ▼
GitHub Pages

GitHub Actions ── scheduled automation ──► pipeline
```

## Current capabilities

- Multi-source RSS ingestion
- Multiple source languages
- Portuguese translation workflow
- Article metadata normalization
- Image extraction from RSS metadata/content
- Timestamp normalization
- Structured JSON output
- Automated hourly execution through GitHub Actions
- Automatic commit/publish of updated news data
- Static browser-based frontend
- Search, language filters and chronological sorting
- Curated Ayorai project portfolio loaded from `data/projects.json`

## Technology

- Python 3.11+
- feedparser
- requests
- deep-translator
- HTML / CSS / JavaScript
- GitHub Actions
- GitHub Pages

## Selected Ayorai portfolio

The public site intentionally presents a curated set of projects rather than an exhaustive list of experiments.

- **Ayorai Tech News AI** — automated RSS ingestion, translation, ETL and publishing.
- **Protesto Credit Scoring** — synthetic-data credit-risk research with ML, fairness and SHAP explainability.
- **OCR-Python** — OCR and document-processing study.
- **Hybrid Data Management RPA Pipeline** — data engineering combined with process automation.
- **Ayorai Financial Control** — browser-based financial data analysis and visualization.
- **Sonic MVP Game** — learning project developed in the context of game-development training.

## Repository structure

```text
.
├── .github/workflows/      # CI automation
├── data/                   # News dataset and portfolio metadata
├── scripts/                # Ingestion and processing scripts
├── index.html              # Web application and portfolio entry point
├── script.js               # Frontend behavior
├── style.css               # Frontend presentation
├── requirements.txt        # Python dependencies
└── README.md
```

## Automation

The production workflow runs on a schedule and can also be triggered manually. The workflow has write permission only for repository contents because the generated dataset is committed back to the repository.

The portfolio layer is deliberately separated from the news ingestion flow: project metadata lives in `data/projects.json`, while the news pipeline continues to publish `data/news.json`.

## Data and attribution

The project stores article metadata and links back to the original sources. It does not claim ownership of third-party articles. Source attribution remains part of the published dataset and user experience.

## Privacy and security

No private organizational credentials, personal records or internal business datasets are required by the public pipeline. API keys are not embedded in the application code.

Portfolio projects that involve sensitive or organizational contexts are represented publicly only through appropriate public repositories, synthetic data or high-level descriptions.

## Portfolio relevance

This repository demonstrates:

- Data ingestion pipelines
- Lightweight ETL
- Content normalization
- Translation workflows
- Automation engineering
- GitHub Actions and scheduled jobs
- Static deployment
- Browser-based application design
- Portfolio-oriented technical documentation

## Status

**Active project.** The automated news-update workflow remains the core function, while the public interface also serves as a curated Ayorai technical portfolio.

## Author

**Anderson Leon Ayora**  
Data Scientist · AI Engineer · Data Architect

Ayorai — Applied AI · Data · Intelligent Automation

[LinkedIn](https://www.linkedin.com/in/anderson-leon-ayora) · [GitHub](https://github.com/Ayorinha)
