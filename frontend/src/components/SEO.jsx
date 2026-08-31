import { Helmet } from "react-helmet-async";
import { SITE } from "../data/site";

export default function SEO({ title, description, path = "/", type = "website", article = null, schema = null }) {
  const fullTitle = title ? `${title} — ${SITE.fullName}` : `${SITE.fullName} — ${SITE.tagline}`;
  const desc = description || SITE.description;
  const url = `${SITE.domain}${path}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: SITE.founder,
      url: SITE.domain,
      jobTitle: "Technology Leader & Advisor",
      description: SITE.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.fullName,
      url: SITE.domain,
    },
    ...(article
      ? [{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.meta_description,
          author: { "@type": "Person", name: article.author },
          datePublished: article.published_at,
          dateModified: article.updated_at,
          mainEntityOfPage: url,
        }]
      : []),
    ...(schema ? [schema] : []),
  ];
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.fullName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <script type="application/ld+json">{JSON.stringify(schemas)}</script>
    </Helmet>
  );
}
