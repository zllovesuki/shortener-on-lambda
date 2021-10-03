import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const BASE_URL = process.env.VUE_APP_API

export default new Vuex.Store({
  state: {
    idToken: localStorage.getItem("idToken") || ''
  },
  getters: {
    hasToken(state) {
      return state.idToken !== ""
    }
  },
  mutations: {
    setToken(state, payload) {
      state.idToken = payload.idToken
      localStorage.setItem('idToken', payload.idToken)
    },
    resetToken(state) {
      state.idToken = ''
      localStorage.removeItem('idToken')
    }
  },
  actions: {
    async makeAuthenticatedRequest(ctx, payload) {
      let method = payload.method || 'GET'
      let req = {
        method: method,
        mode: 'cors',
        headers: {
          "Authorization": "Bearer " + ctx.state.idToken
        }
      }
      if (method != 'GET') {
        req.body = JSON.stringify(payload.body)
        req.headers['Content-Type'] = 'application/json'
      }
      let resp = await fetch(BASE_URL + payload.endpoint, req)
      if (resp.status == 401) {
        ctx.commit({
          type: 'resetToken'
        })
      }
      return resp
    }
  },
  modules: {
  }
})
