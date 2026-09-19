package com.jansetu.grant.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String index() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="refresh" content="3;url=http://localhost:5173/">
                <title>JanSetu Digital Subsidy API Service</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background-color: #0c1524;
                        color: #f8fafc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .card {
                        background: #172438;
                        border: 1px solid #2d3f5e;
                        padding: 36px 42px;
                        border-radius: 16px;
                        text-align: center;
                        max-width: 520px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    }
                    .badge {
                        background: rgba(16, 185, 129, 0.15);
                        color: #34d399;
                        border: 1px solid #059669;
                        font-weight: 700;
                        padding: 6px 14px;
                        border-radius: 20px;
                        font-size: 13px;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 20px;
                    }
                    .dot {
                        width: 8px;
                        height: 8px;
                        background: #10b981;
                        border-radius: 50%;
                        display: inline-block;
                        box-shadow: 0 0 10px #10b981;
                    }
                    h1 {
                        color: #38bdf8;
                        font-size: 26px;
                        margin: 0 0 12px 0;
                    }
                    p {
                        color: #94a3b8;
                        font-size: 15px;
                        line-height: 1.6;
                        margin: 8px 0;
                    }
                    code {
                        background: #0f172a;
                        color: #e2e8f0;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: monospace;
                    }
                    .btn {
                        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                        color: #ffffff;
                        text-decoration: none;
                        padding: 12px 28px;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 15px;
                        display: inline-block;
                        margin-top: 24px;
                        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                        transition: all 0.2s ease-in-out;
                    }
                    .btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 18px rgba(37, 99, 235, 0.5);
                    }
                    .subtext {
                        margin-top: 14px;
                        font-size: 12px;
                        color: #64748b;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="badge"><span class="dot"></span> Spring Boot REST & STOMP Service Active</div>
                    <h1>JanSetu Subsidy Platform API</h1>
                    <p>You have accessed the backend API server running on <code>Port 8088</code>.</p>
                    <p>The interactive citizen portal & officer workflow web UI is hosted on <code>Port 5173</code>.</p>
                    <a href="http://localhost:5173/" class="btn">Open Web Application UI (Port 5173) ➔</a>
                    <div class="subtext">Auto-redirecting to web portal in 3 seconds...</div>
                </div>
            </body>
            </html>
            """;
    }
}
