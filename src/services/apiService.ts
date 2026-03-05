import axios from 'axios'
import { API_CONFIG } from '../config/api'

const tmdb = axios.create({
  baseURL: API_CONFIG.TMDB_BASE_URL,
  params: { api_key: API_CONFIG.TMDB_API_KEY },
})

export const getTrending = (mediaType = 'all', timeWindow = 'week') =>
  tmdb.get(`/trending/${mediaType}/${timeWindow}`)

export const getMovieDetails = (id: string | number) =>
  tmdb.get(`/movie/${id}`)

export const getTVDetails = (id: string | number) =>
  tmdb.get(`/tv/${id}`)

export const getSimilar = (mediaType: string, id: string | number) =>
  tmdb.get(`/${mediaType}/${id}/similar`)

export const getVideos = (mediaType: string, id: string | number) =>
  tmdb.get(`/${mediaType}/${id}/videos`)

export const searchMulti = (query: string) =>
  tmdb.get('/search/multi', { params: { query } })

export const getDiscover = (mediaType: string, params: Record<string, string>) =>
  tmdb.get(`/discover/${mediaType}`, { params })

export default tmdb
