# Ayorai Global Tech News AI

> Automated technology-news ingestion, translation and publishing pipeline.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/) [![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions) [![RSS](https://img.shields.io/badge/Data-RSS%20Feeds-orange)](https://www.rssboard.org/rss-specification)

## Overview

Ayorai Global Tech News AI is a lightweight automated pipeline that collects technology news from multiple RSS sources, extracts available metadata and images, translates supported content to Portuguese, and publishes a browser-based news experience through GitHub Pages.

The project demonstrates a practical combination of **data ingestion, content processing, automation and static web deployment** without requiring a dedicated application server.

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

## Technology

- Python 3.11+
- feedparser
- requests
- deep-translator
- HTML / CSS / JavaScript
- GitHub Actions
- GitHub Pages

## Repository structure

```text
.
├── .github/workflows/      # CI automation
├── data/                   # Generated news dataset
├── scripts/                # Ingestion and processing scripts
├── index.html              # Web application
├── script.js               # Frontend behavior
├── style.css               # Frontend presentation
├── requirements.txt        # Python dependencies
└── README.md
```

## Automation

The production workflow runs on a schedule and can also be triggered manually. The workflow has write permission only for repository contents because the generated dataset is committed back to the repository. The existing deployment pipeline is intentionally preserved while the portfolio documentation is improved.

## Data and attribution

The project stores article metadata and links back to the original sources. It does not claim ownership of third-party articles. Source attribution remains part of the published dataset and user experience.

## Privacy and security

No private organizational credentials, personal records or internal business datasets are required by the public pipeline. API keys are not embedded in the application code.

## Portfolio relevance

This repository is part of the Ayorai portfolio and demonstrates:

- Data ingestion pipelines
- Automation engineering
- Lightweight ETL
- Content normalization
- Translation workflows
- GitHub Actions
- Static deployment
- Maintainable browser-based applications

## Status

**Active project.** The automated news-update workflow and existing site behavior are intentionally preserved while the repository is progressively documented and organized.

## Author

**Anderson Leon Ayora**  
Data Scientist · AI Engineer · Data Architect

Ayorai — Applied AI · Data · Intelligent Automation

[LinkedIn](https://www.linkedin.com/in/anderson-leon-ayora) · [GitHub](https://github.com/Ayorinha)
