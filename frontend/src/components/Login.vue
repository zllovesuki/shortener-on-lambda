<template>
    <b-row class="vh-100 text-center" align-v="center">
        <b-col>
          <b-button class="main-navigation-button" variant="success" v-on:click="cognitoRedirect">Sign in using AWS Cognito</b-button>
        </b-col>
    </b-row>
</template>

<script>

let cognito = {
  url: process.env.VUE_APP_COGNITO_URL,
  clientId: process.env.VUE_APP_COGNITO_CLIENT_ID,
  scopes: ['email'],
  callback: process.env.VUE_APP_FRONTEND
}

export default {
  name: "Login",
  methods: {
    cognitoRedirect() {
      const u = new URL(cognito.url + '/login')
      u.searchParams.append('client_id', cognito.clientId)
      u.searchParams.append('scopes', cognito.scopes.join(' '))
      u.searchParams.append('response_type', 'token')
      u.searchParams.append('redirect_uri', cognito.callback)
      window.location.href = u.href
    }
  },
  mounted() {
    const h = window.location.hash
    if (h.length < 1) {
      return
    }
    window.location.hash = ''
    const parsedHash = new URLSearchParams(h.substr(1))
    const idToken = parsedHash.get("id_token")
    this.$store.commit({
      type: 'setToken',
      idToken
    })
  }
}
</script>
