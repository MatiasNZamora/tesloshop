import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { diskStorage } from 'multer';
import { Response } from 'express';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly  configService: ConfigService,
  ) {}


  @Post('product')
  @UseInterceptors( FileInterceptor('file', { 
    fileFilter: fileFilter, 
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }))
  uploadProductFiles( @UploadedFile() file: Express.Multer.File ) {
    
    if(!file) throw new BadRequestException('Make sure that file is an image');

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${ file.filename }`;

    return { secureUrl };
  };

  @Get('product/:imageName')
  findProductImage( 
    @Param( 'imageName' ) imageName: string,
    @Res() res: Response 
  ){

    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile( path );
  };

};
