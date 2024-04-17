import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ClientProxy } from '@nestjs/microservices';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject('PRODUCT_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const newProduct = await this.productService.create(createProductDto);
    this.client.emit('product_created', newProduct);
    return newProduct;
  }

  @Post(':id/like')
  async like(@Param('id') id: string) {
    console.log('Like product with id:', id);
    const product = await this.productService.findOne(+id);
    const updatedProduct = await this.productService.update(+id, {
      likes: product.likes + 1,
    });
    return updatedProduct;
  }

  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    await this.productService.update(+id, updateProductDto);
    const updatedProduct = await this.productService.findOne(+id);
    this.client.emit('product_updated', updatedProduct);
    return updatedProduct;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.client.emit('product_deleted', id);
    return this.productService.remove(+id);
  }
}
