import { Injectable } from '@nestjs/common';
import { CreateQrDto } from './dto/generate-qr.dto';
import { UpdateQrDto } from './dto/active-qr-list.dto';

@Injectable()
export class QrService {
  create(createQrDto: CreateQrDto) {
    return 'This action adds a new qr';
  }

  findAll() {
    return `This action returns all qr`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qr`;
  }

  update(id: number, updateQrDto: UpdateQrDto) {
    return `This action updates a #${id} qr`;
  }

  remove(id: number) {
    return `This action removes a #${id} qr`;
  }
}
