declare module "music-tempo" {
  export default function MusicTempo(
    audioData: Float32Array
  ): {
    tempo: number;
    beats: number[];
  } | null;
}
