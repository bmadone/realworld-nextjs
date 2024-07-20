import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/api/types';

interface ArticlePageProps {
  article: Article;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ article }) => {
  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>

          <div className="article-meta">
            <Link href={`/profile/${article.author.username}`}>
              <Image
                alt="Avatar"
                width={100}
                height={100}
                src={article.author.image}
              />
            </Link>
            <div className="info">
              <Link
                href={`/profile/${article.author.username}`}
                className="author"
              >
                {article.author.username}
              </Link>
              <span className="date">
                {new Date(article.createdAt).toDateString()}
              </span>
            </div>
            <button className="btn btn-sm btn-outline-secondary">
              <i className="ion-plus-round"></i>
              &nbsp; Follow {article.author.username}{' '}
              <span className="counter">(10)</span>
            </button>
            &nbsp;&nbsp;
            <button className="btn btn-sm btn-outline-primary">
              <i className="ion-heart"></i>
              &nbsp; Favorite Post{' '}
              <span className="counter">({article.favoritesCount})</span>
            </button>
            <button className="btn btn-sm btn-outline-secondary">
              <i className="ion-edit"></i> Edit Article
            </button>
            <button className="btn btn-sm btn-outline-danger">
              <i className="ion-trash-a"></i> Delete Article
            </button>
          </div>
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <p>{article.description}</p>
            <div
              dangerouslySetInnerHTML={{
                __html: article.body.replace(/\n/g, '<br />'),
              }}
            />
            <ul className="tag-list">
              {article.tagList.map((tag) => (
                <li key={tag} className="tag-default tag-pill tag-outline">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <div className="article-meta">
            <Link href={`/profile/${article.author.username}`}>
              <Image
                alt="Avatar"
                src={article.author.image}
                width={30}
                height={26}
              />
            </Link>
            <div className="info">
              <Link
                href={`/profile/${article.author.username}`}
                className="author"
              >
                {article.author.username}
              </Link>
              <span className="date">
                {new Date(article.createdAt).toDateString()}
              </span>
            </div>
            <button className="btn btn-sm btn-outline-secondary">
              <i className="ion-plus-round"></i>
              &nbsp; Follow {article.author.username}
            </button>
            &nbsp;
            <button className="btn btn-sm btn-outline-primary">
              <i className="ion-heart"></i>
              &nbsp; Favorite Article{' '}
              <span className="counter">({article.favoritesCount})</span>
            </button>
            <button className="btn btn-sm btn-outline-secondary">
              <i className="ion-edit"></i> Edit Article
            </button>
            <button className="btn btn-sm btn-outline-danger">
              <i className="ion-trash-a"></i> Delete Article
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            <form className="card comment-form">
              <div className="card-block">
                <textarea
                  className="form-control"
                  placeholder="Write a comment..."
                  rows={3}
                ></textarea>
              </div>
              <div className="card-footer">
                <Image
                  src={article.author.image}
                  className="comment-author-img"
                  alt="Avatar"
                  width={30}
                  height={26}
                />
                <button className="btn btn-sm btn-primary">Post Comment</button>
              </div>
            </form>

            {/* Example comment card */}
            <div className="card">
              <div className="card-block">
                <p className="card-text">
                  With supporting text below as a natural lead-in to additional
                  content.
                </p>
              </div>
              <div className="card-footer">
                <Link
                  href={`/profile/${article.author.username}`}
                  className="comment-author"
                >
                  <Image
                    src={article.author.image}
                    className="comment-author-img"
                    alt="Avatar"
                    width={30}
                    height={26}
                  />
                </Link>
                &nbsp;
                <Link
                  href={`/profile/${article.author.username}`}
                  className="comment-author"
                >
                  {article.author.username}
                </Link>
                <span className="date-posted">
                  {new Date(article.createdAt).toDateString()}
                </span>
                <span className="mod-options">
                  <i className="ion-trash-a"></i>
                </span>
              </div>
            </div>

            {/* Repeat the comment card as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch(
      'https://api.realworld.io/api/articles/Ill-quantify-the-redundant-TCP-bus-that-should-hard-drive-the-ADP-bandwidth!-553'
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch article: ${res.statusText}`);
    }

    const data = await res.json();
    const article = data.article;

    return {
      props: {
        article,
      },
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      notFound: true,
    };
  }
};

export default ArticlePage;
