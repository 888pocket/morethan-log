import { NextApiRequest, NextApiResponse } from "next"
import { getPosts } from "../../apis"

// for all path revalidate, https://<your-site.com>/api/revalidate?secret=<token>
// for specific path revalidate, https://<your-site.com>/api/revalidate?secret=<token>&path=<path>
// example, https://<your-site.com>/api/revalidate?secret=이것은_키&path=feed
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, path } = req.query
  if (secret !== process.env.TOKEN_FOR_REVALIDATE) {
    return res.status(401).json({ message: "Invalid token" })
  }

  try {
    let temp
    if (path && typeof path === "string") {
      await res.revalidate(path)
    } else {
      const posts = await getPosts()
      temp = posts
      await res.revalidate(`/`)
      const revalidateRequests = posts.map((row) => {
        res.revalidate(`/${row.slug}`)
        console.log(row.slug)
      })
      await Promise.all(revalidateRequests)
    }

    res.json(temp)
  } catch (err) {
    return res.status(500).send("Error revalidating")
  }
}
