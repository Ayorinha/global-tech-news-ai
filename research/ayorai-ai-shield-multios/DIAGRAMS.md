# AYORAI AI Shield — Architecture Diagrams

These diagrams are maintained as architecture references and can later be converted into formal design assets.

## Global security map

~~~mermaid
flowchart TB
    subgraph SURFACES[Protection Surfaces]
      W[Windows]
      M[macOS]
      L[Linux]
      MOB[Mobile]
      SRV[Servers]
      CNT[Containers / Cloud]
    end
    subgraph CORE[Portable Security Core]
      EVT[Common Event Model]
      POL[Policy Engine]
      RISK[Risk Engine]
      DET[Detection & Correlation]
      RESP[Response Engine]
      EVID[Evidence Engine]
    end
    subgraph INTEL[Intelligence]
      TI[Threat Intelligence]
      VULN[Vulnerability Intelligence]
      AISEC[AI Security Knowledge]
      TEST[Synthetic Test Generation]
    end
    subgraph ASSURANCE[Assurance]
      CI[CI Regression]
      STAGE[Staging / Canary]
      EXT[Independent Testing]
      AUDIT[Audit / Transparency]
    end
    SURFACES --> EVT
    EVT --> POL
    POL --> RISK
    RISK --> DET
    TI --> DET
    VULN --> DET
    AISEC --> DET
    DET --> RESP
    RESP --> EVID
    TEST --> CI
    DET --> CI
    CI --> STAGE
    STAGE --> SURFACES
    EXT --> AUDIT
    EVID --> AUDIT
~~~

## Endpoint architecture

~~~mermaid
flowchart LR
    UI[Local Status UI]
    AGENT[Native Agent]
    CORE[Portable Security Core]
    ADAPTER[OS Adapter]
    SENSOR[Native Sensors]
    ENFORCE[Native Enforcement]
    EVID[Evidence Store]
    UPDATE[Signed Update Client]
    UI -. status only .-> AGENT
    SENSOR --> ADAPTER
    ADAPTER --> CORE
    CORE --> ENFORCE
    CORE --> EVID
    UPDATE --> AGENT
    AGENT --> CORE
    ENFORCE --> EVID
~~~

## Assurance loop

~~~mermaid
flowchart LR
    REF[Official References] --> MAP[Threat Mapping]
    MAP --> GEN[Synthetic Cases]
    GEN --> TEST[Shield Evaluation]
    TEST --> REG[Regression]
    REG --> STAGE[Staging]
    STAGE --> REVIEW[Human Review]
    REVIEW --> RELEASE[Controlled Release]
    RELEASE --> MON[Monitoring]
    MON --> EVID[Evidence]
    EVID --> REF
~~~

## Update safety

~~~mermaid
flowchart LR
    INGEST[Ingest] --> VERIFY[Verify]
    VERIFY --> NORM[Normalize]
    NORM --> ANALYZE[Analyze]
    ANALYZE --> TEST[Generate Tests]
    TEST --> REG[Regression]
    REG --> CANARY[Canary]
    CANARY --> MON[Monitor]
    MON --> PROMOTE[Promote]
    MON --> ROLLBACK[Rollback]
~~~

## Product evolution

~~~mermaid
flowchart TB
    LAB[Current AI Laboratory]
    CORE[Portable Defensive Core]
    ENDPOINT[Endpoint]
    SERVER[Server / Workload]
    XDR[XDR Correlation]
    AI[AI / Agent Security]
    MOBILE[Mobile]
    ASSURE[Independent Assurance]
    PRIME[Prime / Enterprise / High Assurance]
    LAB --> CORE
    CORE --> ENDPOINT
    CORE --> SERVER
    ENDPOINT --> XDR
    SERVER --> XDR
    XDR --> AI
    AI --> MOBILE
    XDR --> ASSURE
    ASSURE --> PRIME
~~~
