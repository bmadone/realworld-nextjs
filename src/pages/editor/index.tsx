import { getAuthToken } from '@/utils/auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';

interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

interface ApiResponse {
  article?: {
    slug: string;
  };
  errors?: Record<string, string[]>;
}

const formatError = (error: Record<string, string[]>): string => {
  return Object.entries(error)
    .map(([key, messages]) => `${key}: ${messages.join(', ')}`)
    .join('; ');
};

const createArticle = async (
  articleData: ArticleData
): Promise<ApiResponse> => {
  const response = await fetch('https://api.realworld.io/api/articles/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${getAuthToken()}`,
    },
    body: JSON.stringify({ article: articleData }),
  });

  return response.json();
};

export default function CreateArticle() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const articleData: ArticleData = {
      title,
      description,
      body,
      tagList: tags,
    };

    try {
      const data = await createArticle(articleData);

      if (data.errors) {
        setError(formatError(data.errors));
      } else if (data.article) {
        router.push(`/article/${data.article.slug}`);
      }
    } catch (err) {
      console.error('An unexpected error occurred:', err);
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTags(value.split(',').map((tag) => tag.trim()));
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            {error && (
              <ul className="error-messages">
                <li>{error}</li>
              </ul>
            )}
            <form onSubmit={handleSubmit}>
              <fieldset disabled={false}>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Article Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="What's this article about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  ></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter tags"
                    onChange={handleTagChange}
                  />
                  <div className="tag-list">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag-default tag-pill">
                        <i className="ion-close-round"></i> {tag}
                      </span>
                    ))}
                  </div>
                </fieldset>
                <button
                  className="btn btn-lg pull-xs-right btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Publishing...' : 'Publish Article'}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
