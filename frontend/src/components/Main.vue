<template>
    <div class="main">
        <Alert ref="alert" :timeout="5" :toast="true" />
        <b-row>
            <b-col>
                <b-form inline @submit.prevent="shorten">
                    <b-form-input
                    v-model="form.url"
                    :disabled="form.disabled"
                    placeholder="Enter Long URL then hit Enter"
                    required
                    ></b-form-input>
                </b-form>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
            <b-table striped hover :items="urls" :fields="fields" v-show="urls.length > 0">
                <template #cell(shortStr)="data">
                    <a :href="base + '/' + data.item.shortStr" target="_blank">{{ data.item.shortStr }}</a>
                </template>
                <template #cell(action)="data">
                    <b-icon icon="trash" v-on:click="deleteUrl(data.item.shortStr)"></b-icon>
                </template>
            </b-table>
            </b-col>
        </b-row>
        <div v-show="urls.length == 0">You haven't created any short urls yet</div>
        <b-row>
            <b-col>
                <b-overlay
                    :show="form.isLoading"
                    rounded
                    opacity="0.6"
                    spinner-small
                    spinner-variant="primary"
                    v-show="earliestCursor !== null"
                    >
                    <b-button
                        block
                        variant="outline-primary"
                        size="sm"
                        href="#"
                        v-on:click="fetchURLs"
                    >
                        Load 10 more
                    </b-button>
                </b-overlay>
            </b-col>
        </b-row>
    </div>
</template>

<script>

const BASE = process.env.VUE_APP_API

import Alert from "../components/Alert.vue";

export default {
    name: "Main",
    components: {
        Alert
    },
    data() {
        return {
            base: BASE,
            form: {
                isLoading: false,
                disabled: false,
                url: ''
            },
            fields: [
                'shortStr',
                'longURL',
                {
                    key: 'createdAt',
                    formatter: v => {
                        return new Date(v).toLocaleString()
                    }
                },
                {
                    key: 'action',
                    label: ''
                }
            ],
            urls: [],
            earliestCursor: new Date().getTime()
        }
    },
    methods: {
        async deleteUrl(short) {
            const index = this.urls.findIndex((i) => i.shortStr === short)
            if (index < 0) return
            this.urls.splice(index, 1)
            await this.$store.dispatch({
                type: 'makeAuthenticatedRequest',
                method: 'DELETE',
                endpoint: '/' + short
            })
        },
        async shorten() {
            this.form.disabled = true
            let resp = await this.createShort()
            let j = await resp.json()    
            if (j.success) {
                this.urls.unshift(j.result)
                this.form.url = ''
            }else{
                 this.$refs.alert.showAlert("danger", j.error)
            }
            this.form.disabled = false
        },
        async createShort() {
            return await this.$store.dispatch({
                type: 'makeAuthenticatedRequest',
                method: 'POST',
                endpoint: '/',
                body: {
                    url: this.form.url
                }
            })
        },
        async fetchURLs() {
            this.form.isLoading = true
            let resp = await this.$store.dispatch({
                type: 'makeAuthenticatedRequest',
                method: 'GET',
                endpoint: '/?earliest=' + this.earliestCursor
            })
            let j = await resp.json()
            if (j.success) {
                this.urls.push(...j.result)
                if (j.result.length > 1) {
                    this.earliestCursor = j.result[j.result.length - 1].createdAt
                }else{
                    this.earliestCursor = null
                }
            }
            this.form.isLoading = false
        }
    },
    async mounted() {
        await this.fetchURLs()
    }
}
</script>