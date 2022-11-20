import app from './app'
import env from './env'

const { PORT } = env

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
