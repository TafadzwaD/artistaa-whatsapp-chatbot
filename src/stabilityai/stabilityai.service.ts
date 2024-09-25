import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class StabilityaiService {
  private readonly httpService = new HttpService();
  private readonly logger = new Logger(StabilityaiService.name);

  readonly configuration = {
    apiHost: process.env.STABILITYAI_API_HOST || '',
    token: process.env.STABILITYAI_TOKEN || '',
    engineId: 'stable-diffusion-xl-1024-v1-0',
  };

  async textToImage(prompt: string) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: this.configuration.token,
      },
    };
    const data = JSON.stringify({
      text_prompts: [
        {
          text: prompt,
        },
      ],
      steps: 40,
    });

    try {
      const url = `${this.configuration.apiHost}/v1/generation/${this.configuration.engineId}/text-to-image`;
      const response = this.httpService
        .post(url, data, config)
        .pipe(
          map((res) => {
            return res.data;
          }),
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new BadRequestException('Error Generating Image');
          }),
        );

      const imageGenerationResponse = await lastValueFrom(response);
      const fileNames: string[] = [];
      const rootPath = process.cwd();
      const folderPath = join(rootPath, 'generatedImages');

      // Check if the folder exists, if not create it
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      imageGenerationResponse.artifacts.forEach((image, index) => {
        const now = new Date();
        const fileName = `v1_txt2img_${now.getTime()}_${index}.png`;
        fs.writeFileSync(
          `${folderPath}/${fileName}`,
          Buffer.from(image.base64, 'base64'),
        );
        fileNames.push(fileName);
      });

      return fileNames;
    } catch (e) {
      return 'Image generation failed, try later.';
    }
  }
}
