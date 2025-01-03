import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import { writeFileSync } from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class AudioService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'http://localhost:8000/v1/',
  });

  private readonly logger = new Logger(AudioService.name);

  async convertAudioToText(
    filePath: string,
  ): Promise<{ status: 'error' | 'success'; data: string }> {
    try {
      const response = await this.openai.audio.transcriptions.create({
        model: 'Systran/faster-whisper-small',
        file: createReadStream(filePath),
      });
      return { status: 'success', data: response.text };
    } catch (e) {
      return { status: 'error', data: 'Audio transcription failed' };
    }
  }

  async convertTextToSpeech(text: string) {
    const url = 'http://localhost:8080';
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/text',
      },
      responseType: 'arraybuffer',
    };
    try {
      const folderName = process.env.AUDIO_FILES_FOLDER;
      const fileName = `${Date.now()}.ogg`;

      const folderPath = path.join(process.cwd(), folderName);
      const filePath = path.join(folderPath, fileName);

      //check if the audio folder exists, if not create
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath);
      }

      const response = await axios.post(url, text, config);

      writeFileSync(filePath, response.data);

      // Define the output file name and path (.mp3 file)
      const mp3FileName = `${Date.now()}.mp3`;
      const mp3FilePath = path.join(folderPath, mp3FileName);

      // Convert the file to .mp3 format
      await new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
          .audioCodec('libmp3lame') // Convert to MP3 codec
          .on('end', () => {
            console.log('Conversion to MP3 completed.');
            resolve();
          })
          .on('error', (err) => {
            console.error('Error during MP3 conversion:', err);
            reject(err);
          })
          .save(mp3FilePath); // Save as .mp3 file
      });
      return { status: 'success', data: mp3FileName };
    } catch (e) {
      this.logger.error('Error fetching url', e);
      return { status: 'error', data: 'Error converting text to speech' };
    }
  }
}
