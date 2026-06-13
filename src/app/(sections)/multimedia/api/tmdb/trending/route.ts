import { NextResponse } from 'next/server';
import { movies, tvShows } from '@multimedia/lib/tmdb';

export async function GET() {
  try {
    const [
      trendingMovies, trendingTV, 
      popularMovies, popularTV, 
      topRatedMovies, topRatedTV,
      nowPlayingMovies,
      upcomingMovies,
      onTheAirTV,
      airingTodayTV
    ] = await Promise.all([
      movies.getTrending('week'),
      tvShows.getTrending('week'),
      movies.getPopular(),
      tvShows.getPopular(),
      movies.getTopRated(),
      tvShows.getTopRated(),
      movies.getNowPlaying(),
      movies.getUpcoming(),
      tvShows.getOnTheAir(),
      tvShows.getAiringToday(),
    ]);

    return NextResponse.json({
      trendingMovies: trendingMovies.results,
      trendingTV: trendingTV.results,
      popularMovies: popularMovies.results,
      popularTV: popularTV.results,
      topRatedMovies: topRatedMovies.results,
      topRatedTV: topRatedTV.results,
      nowPlayingMovies: nowPlayingMovies.results,
      upcomingMovies: upcomingMovies.results,
      onTheAirTV: onTheAirTV.results,
      airingTodayTV: airingTodayTV.results,
    });
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
}
