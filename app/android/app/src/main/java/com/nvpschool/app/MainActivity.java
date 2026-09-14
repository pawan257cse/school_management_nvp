package com.nvpschool.app;

import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().setWebViewClient(new WebViewClient() {
                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    if (request != null && request.isForMainFrame()) {
                        String offlineHtml = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'><style>" +
                            "body { background-color: #020617; color: white; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }" +
                            ".card { background: #0f172a; padding: 30px 24px; border-radius: 24px; border: 1px solid #1e293b; max-width: 340px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }" +
                            "img { width: 72px; height: 72px; margin-bottom: 16px; border-radius: 50%; border: 2px solid #6366f1; padding: 4px; background: white; object-fit: contain; }" +
                            "h2 { font-size: 20px; font-weight: 900; margin: 0 0 8px 0; color: #f8fafc; }" +
                            "p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 20px 0; }" +
                            "button { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; shadow: 0 4px 12px rgba(79,70,229,0.4); width: 100%; }" +
                            "</style></head><body>" +
                            "<div class='card'>" +
                            "<img src='file:///android_asset/public/logo.png' onError=\"this.style.display='none'\" />" +
                            "<h2>No Internet Connection</h2>" +
                            "<p>NVP School ERP requires an active internet connection. Please turn on Wi-Fi or Mobile Data and try again.</p>" +
                            "<button onclick='window.location.reload()'>Retry Connection</button>" +
                            "</div></body></html>";
                        view.loadDataWithBaseURL(null, offlineHtml, "text/html", "UTF-8", null);
                    }
                }
            });
        }
    }
}
