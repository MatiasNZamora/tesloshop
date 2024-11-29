export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {
    // console.log({ file })

    if(!file) return callback( new Error('File is empty'), false);

    // verifica la extencion cortando luego de la barra.
    const fileExtension = file.mimetype.split('/')[1];
    //formatos de imagen valido
    const validExtensions = ['jpg', 'webp', 'jpeg', 'gif', 'png'];

    //valida que el archivo se encuentra dentro del array
    if( validExtensions.includes( fileExtension )){
        return callback( null, true );
    }

    callback(null, false);
    
};