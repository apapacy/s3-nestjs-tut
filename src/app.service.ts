import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import fastify = require('fastify');
import { AppResponseDto } from './dto/app.response.dto';
import * as sharp from 'sharp';

@Injectable()
export class AppService {
  async uploadFile(req: fastify.FastifyRequest): Promise<any> {
    const promises = [];
    return new Promise((resolve, reject) => {
      const mp = req.multipart(handler, onEnd);
      mp.on(
        'file',
        (
          fieldname: string,
          stream: any,
        ) => {
          stream.on('end', function() {
            if (stream.truncated) {
              reject(
                new BadRequestException(
                  new AppResponseDto(
                    400,
                    undefined,
                    'Maximum size of file reached',
                  ),
                ),
              );
            }
          });
        },
      );
      mp.on('partsLimit', () => {
        reject(
          new BadRequestException(
            new AppResponseDto(
              400,
              undefined,
              'Maximum number of form parts reached',
            ),
          ),
        );
      });

      mp.on('filesLimit', () => {
        reject(
          new BadRequestException(
            new AppResponseDto(
              400,
              undefined,
              'Maximum number of files reached',
            ),
          ),
        );
      });

      mp.on('fieldsLimit', () => {
        reject(
          new BadRequestException(
            new AppResponseDto(
              400,
              undefined,
              'Maximum number of fields reached',
            ),
          ),
        );
      });

      mp.on('field', function(key, value) {
        console.log('form-data', key, value);
      });

      function onEnd(err) {
        if (err) {
          reject(new HttpException(err, 500));
        } else {
          Promise.all(promises).then(
            data => {
              resolve({ result: 'OK' });
            },
            err => {
              reject(new HttpException(err, 500));
            },
          );
        }
      }

      function handler(field, file, filename, encoding, mimetype: string) {
        if (mimetype && mimetype.match(/^image\/(.*)/)) {
          const imageType = mimetype.match(/^image\/(.*)/)[1];
          const s3Stream = new S3({
            accessKeyId: 'minio',
            secretAccessKey: 'minio123',
            endpoint: 'http://127.0.0.1:9001',
            s3ForcePathStyle: true, // needed with minio?
            signatureVersion: 'v4',
          });
          const promise = s3Stream
            .upload(
              {
                Bucket: 'test',
                Key: `200x200_${filename}`,
                Body: file.pipe(
                  sharp()
                    .resize(200, 200)
                    [imageType](),
                ),
              }
            )
            .promise();
          promises.push(promise);
        }
        const s3Stream = new S3({
          accessKeyId: 'minio',
          secretAccessKey: 'minio123',
          endpoint: 'http://127.0.0.1:9001',
          s3ForcePathStyle: true, // needed with minio?
          signatureVersion: 'v4',
        });
        const promise = s3Stream
          .upload({ Bucket: 'test', Key: filename, Body: file })
          .promise();
        promises.push(promise);
      }
    });
  }
}
