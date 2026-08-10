function PostArticleBody({ content }) {
  if (!content) {
    return null
  }

  return (
    <div className="prose prose-slate max-w-none text-base leading-relaxed text-slate-700 sm:text-lg sm:leading-8 whitespace-pre-wrap break-words">
      {content}
    </div>
  )
}

export default PostArticleBody
