<template>
  <div>
    <Login v-if="!$store.getters.hasToken" />
    <Main v-if="$store.getters.hasToken" />
  </div>
</template>

<script>
import Login from "../components/Login.vue"
import Main from "../components/Main.vue"

export default {
  name: 'Home',
  components: {
    Login,
    Main
  }
}
</script>
