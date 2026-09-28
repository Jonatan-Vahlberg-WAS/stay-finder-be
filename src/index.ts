import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

import properties from './routes/properties.js'
import bookings from './routes/bookings.js'

const app = new Hono({ strict: false })

app.use(prettyJSON())

app.get('/', (c) => {
  return c.json({
    name: "Stay Finder"

  })
})

app.route("/properties",properties)
app.route("/bookings",bookings)
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
