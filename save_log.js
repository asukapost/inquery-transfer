var KintoneManager = (function() {
    "use strict";
    // API認証で行う
    // apps は以下の形式
    // {
    //   // アプリケーション名はkintoneのデータに依存せず、GASないのコードで取り扱う専用
    //   YOUR_APP_NAME: {
    //     appid: 1,
    //     name: "YOUR_APP_NAME",
    //     token: "XXXXXXXXXX_YOUR_TOKEN_XXXXXXXXXX"
    //   },
    //   YOUR_APP_NAME2: {
    //     ...
    //   }
    // }
  
    function KintoneManager(subDomain,  apps) {
      this.subDomain = subDomain
      this.apps = apps
    }
  
    // create record
    /**
     * @param {string} app_name Application name
     * @param {Array} records Kintone record objecs ref
     * @returns {HTTPResponse} red
     */
    KintoneManager.prototype.create = function(app_name, record) {
      var app = this.apps[app_name]
      var payload = {
        app: app.appid,
        record: record
      }
      var response = UrlFetchApp.fetch(
        "@1/record.json".replace(/@1/g, this._getEndpoint(app.guestid)),
        this._postOption(app, payload)
      )
      
      return response
    }
  
    // option for POST method
    /**
     * @param {object} app Application object
     * @param {object} payload Request payload
     * @returns {object} Option for UrlFetchApp
     */
    KintoneManager.prototype._postOption = function(app, payload) {
      var option = {
        method: "post",
        contentType: "application/json",
        headers: this._authorizationHeader(app),
        muteHttpExceptions: true,
        payload: JSON.stringify(payload)
      };
      return option
    }
  
    // Gets Endpoint
    /**
     * @param {string} guest_id (optional) Guest if you are a guest account.
     * @returns {string} Endpoint URL
     */
    KintoneManager.prototype._getEndpoint = function(guest_id) {
      if (this.subDomain.slice(-4) == '.com') {
        var endpoint = "https://@1".replace(/@1/g, this.subDomain)
      } else {
        var endpoint = "https://@1.cybozu.com".replace(/@1/g, this.subDomain)
      }
      if (guest_id == null) {
        return endpoint + "/k/v1"
      } else {
        return endpoint + "k/guest/@1/v1".replace(/@1/g, guest_id)
      }
    }
  
    // Header Authentication Information
    /**
     * @param {object} app Application object
     * @param {string} app.token Application's API token
     * @returns {object}
     */
    KintoneManager.prototype._authorizationHeader = function(app) {
      if (app.token) {
        return {"X-Cybozu-API-Token": app.token }
      } else {
        throw new Error("Authentication Failed")
      }
    }
    return KintoneManager
  })()
  
  function save_to_kintone(record) {
    // Kintone Info
    const subDomain = 'YOUR_DOMAIN'
    const apps = {
      "contact_log_app": { appid: 1111, name: "YOUR_APP_NAME", token: "YOUR_TOKEN" }
    }
    const kintone_manager = new KintoneManager(subDomain, apps)
  
  
    const response = kintone_manager.create("contact_log_app", record)
  
    const code = response.getResponseCode()
    console.log('Kintone', code)
  }
  