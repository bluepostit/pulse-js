import dotenv from 'dotenv'
dotenv.config()
import app from './app'

const { PORT = 3000 } = process.env

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
