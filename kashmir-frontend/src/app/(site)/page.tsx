import Hero            from '@/components/sections/Hero';
import FilmOverview    from '@/components/sections/FilmOverview';
import Trailer         from '@/components/sections/Trailer';
import Duality         from '@/components/sections/Duality';
import HistorySection  from '@/components/sections/HistorySection';
import NewsFeed        from '@/components/sections/NewsFeed';
import SocialFeed      from '@/components/sections/SocialFeed';
import Watch           from '@/components/sections/Watch';
import Footer          from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <div data-atmosphere="warm"><Hero /></div>
      <div data-atmosphere="warm"><FilmOverview /></div>
      <div data-atmosphere="neutral"><Trailer /></div>
      <div data-atmosphere="warm"><Duality /></div>
      <div data-atmosphere="cold"><HistorySection /></div>
      <div data-atmosphere="neutral"><NewsFeed /></div>
      <div data-atmosphere="neutral"><SocialFeed /></div>
      <div data-atmosphere="warm"><Watch /></div>
      <div data-atmosphere="neutral"><Footer /></div>
    </>
  );
}
