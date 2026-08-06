import PostCard from '../../posts/components/PostCard.jsx'

function SearchResultsList({ posts }) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
      {posts.map((post) => (
        <li key={post.id || post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  )
}

export default SearchResultsList
