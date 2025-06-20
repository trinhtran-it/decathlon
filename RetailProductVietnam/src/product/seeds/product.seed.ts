import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { Logger } from '@nestjs/common';

@Injectable()
export class ProductSeed {
  private readonly logger = new Logger(ProductSeed.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  @Command({
    command: 'seed:products',
    describe: 'Seed product data',
  })
  async seed() {
    this.logger.log('Seeding products...');
    
    // Clear existing products
    await this.productModel.deleteMany({});
    
    const products = [
      {
        productId: '121721252883996',
        name: 'Running Shoes Pro',
        price: 1250000,
        description: 'Professional running shoes with advanced cushioning for long-distance runs',
        imageUrl: 'https://contents.mediadecathlon.com/p2819293/sq/k$dcef0a13ada1ab05d340747e26e9cebe/gi%C3%A0y-ch%E1%BA%A1y-b%E1%BB%99-ch%E1%BA%A1y-trail-nam-jf190-1-grip-xanh-d%C6%B0%C6%A1ng-kalenji-8913912.jpg',
        category: 'Footwear',
        brand: 'Decathlon',
        weight: 280,
        attributes: { 
          color: 'Black/Red', 
          size: '42', 
          material: 'Breathable mesh with rubber sole' 
        }
      },
      {
        productId: '062465116620924',
        name: 'Fitness Training Mat',
        price: 350000,
        description: 'Non-slip fitness mat for yoga and floor exercises',
        imageUrl: 'https://contents.mediadecathlon.com/p2756060/sq/k$435bb57319693b77f89b47e63eb0a9e6/th%E1%BA%A3m-t%E1%BA%ADp-t%E1%BA%A1-58-x-58-cm-%C4%91en-domyos-8651539.jpg',
        category: 'Fitness Accessories',
        brand: 'Domyos',
        weight: 950,
        attributes: { 
          color: 'Blue', 
          dimensions: '180cm x 60cm x 6mm', 
          material: 'NBR foam' 
        }
      },
      {
        productId: '103589485714914',
        name: 'Mountain Bike Helmet',
        price: 680000,
        description: 'Protective helmet designed for off-road cycling',
        imageUrl: 'https://contents.mediadecathlon.com/p2443246/sq/k$f6e485ec3438ec893b159864fa028763/m%C5%A9-b%E1%BA%A3o-hi%E1%BB%83m-xe-%C4%91%E1%BA%A1p-%C4%91%E1%BB%8Ba-h%C3%ACnh-expl-100-xanh-d%C6%B0%C6%A1ng-rockrider-8618918.jpg',
        category: 'Cycling',
        brand: 'BTWIN',
        weight: 310,
        attributes: { 
          color: 'Green/Black', 
          size: 'M/L', 
          ventilation: 'High' 
        }
      },
      {
        productId: '142282483153333',
        name: 'Tennis Racket Pro',
        price: 1450000,
        description: 'Professional tennis racket for competitive play',
        imageUrl: 'https://contents.mediadecathlon.com/p2486795/sq/k$a8f0db1f6e61d7d2712fd5c2cb79d62a/v%E1%BB%A3t-tennis-ng%C6%B0%E1%BB%9Di-l%E1%BB%9Bn-300g-tr990-power-pro-%C4%91%E1%BB%8F-%C4%91en-artengo-8646121.jpg',
        category: 'Tennis',
        brand: 'Artengo',
        weight: 285,
        attributes: { 
          gripSize: '4 3/8', 
          headSize: '645cm²', 
          stringPattern: '16x19' 
        }
      },
      {
        productId: '257125330047334',
        name: 'Hiking Backpack 30L',
        price: 840000,
        description: 'Comfortable backpack for day hikes with multiple compartments',
        imageUrl: 'https://contents.mediadecathlon.com/p1640206/sq/k$0d498612ec2b09d4e566094a8c6be8cb/balo-leo-n%C3%BAi-du-l%E1%BB%8Bch-30l-d%C3%A2y-gi%E1%BB%AF-g%E1%BA%ADy-nh-arpenaz-100-%C4%91en-h%E1%BB%8Da-ti%E1%BA%BFt-ch%C3%ACm-quechua-8550766.jpg',
        category: 'Hiking',
        brand: 'Quechua',
        weight: 780,
        attributes: { 
          color: 'Grey/Orange', 
          capacity: '30L', 
          waterResistant: true 
        }
      },
      {
        productId: '186610557160709',
        name: 'Basketball Indoor/Outdoor',
        price: 420000,
        description: 'Basketball suitable for both indoor and outdoor courts',
        imageUrl: 'https://contents.mediadecathlon.com/p2689322/sq/k$f0aec3289a09c45a7e6b73c097bc2de1/b%E1%BB%99-v%C3%A0nh-b%C3%B3ng-r%E1%BB%95-th%C3%B4ng-minh-k%C3%A8m-tr%C3%B2-ch%C6%A1i-mini-basketball-play-%C4%91en-tr%E1%BA%AFng-tarmak-8757751.jpg',
        category: 'Team Sports',
        brand: 'Tarmak',
        weight: 600,
        attributes: { 
          size: '7', 
          material: 'Composite leather', 
          grip: 'Enhanced' 
        }
      },
      {
        productId: '086567207044556',
        name: 'Swimming Goggles Anti-Fog',
        price: 230000,
        description: 'Anti-fog swimming goggles with UV protection',
        imageUrl: 'https://contents.mediadecathlon.com/p2042633/sq/k$78ba777fac91f6f6cb6def454009d9f2/k%C3%ADnh-b%C6%A1i-tr%C3%B2ng-k%C3%ADnh-trong-su%E1%BB%91t-m%E1%BB%99t-c%E1%BB%A1-ready-x%C3%A1m-nabaiji-8616684.jpg',
        category: 'Swimming',
        brand: 'Nabaiji',
        weight: 45,
        attributes: { 
          color: 'Blue/Clear', 
          lensType: 'Anti-fog', 
          uvProtection: true 
        }
      },
      {
        productId: '087980450662268',
        name: 'Trekking Poles (Pair)',
        price: 580000,
        description: 'Adjustable trekking poles for hiking and mountaineering',
        imageUrl: 'https://contents.mediadecathlon.com/p2700065/sq/k$62fc4e19e235484c50fac654e08f045a/g%E1%BA%ADy-leo-n%C3%BAi-si%C3%AAu-g%E1%BB%8Dn-nh%E1%BA%B9-mt900-%C4%91en-forclaz-8810536.jpg',
        category: 'Hiking',
        brand: 'Forclaz',
        weight: 480,
        attributes: { 
          color: 'Black', 
          material: 'Aluminum', 
          adjustable: true 
        }
      },
      {
        productId: '190075738712390',
        name: 'Gym Training Gloves',
        price: 320000,
        description: 'Protective gloves for weightlifting and gym training',
        imageUrl: 'https://contents.mediadecathlon.com/p2832341/sq/k$ec5d285d4f1fd14e41ec884d2247415f/g%C4%83ng-tay-t%E1%BA%ADp-t%E1%BA%A1-n%C3%A2u-corength-8883186.jpg',
        category: 'Fitness Accessories',
        brand: 'Domyos',
        weight: 120,
        attributes: { 
          color: 'Black/Grey', 
          size: 'L', 
          material: 'Synthetic leather' 
        }
      },
      {
        productId: '192746461041887',
        name: 'Road Cycling Jersey',
        price: 620000,
        description: 'Breathable cycling jersey for road cycling',
        imageUrl: 'https://contents.mediadecathlon.com/p2465001/sq/k$25d28156ab1dddb30b5079df2d2bdbe8/%C3%A1o-jersey-%C4%91%E1%BA%A1p-xe-rc500-cho-n%E1%BB%AF-t%C3%ADm-lavender-van-rysel-8798799.jpg',
        category: 'Cycling',
        brand: 'BTWIN',
        weight: 150,
        attributes: { 
          color: 'Blue/White', 
          size: 'M', 
          material: 'Polyester blend' 
        }
      },
      {
        productId: '189462332953992',
        name: 'Waterproof Hiking Boots',
        price: 1150000,
        description: 'Waterproof boots for mountain hiking with ankle support',
        imageUrl: 'https://contents.mediadecathlon.com/p1956727/sq/k$c946789daff9c7bcba705270c0883c30/gi%C3%A0y-hiking-c%E1%BB%95-l%E1%BB%ADng-ch%E1%BB%91ng-th%E1%BA%A5m-nh150-cho-n%E1%BB%AF-x%C3%A1m-%C4%91en-quechua-8602931.jpg',
        category: 'Hiking',
        brand: 'Quechua',
        weight: 950,
        attributes: { 
          color: 'Brown', 
          size: '43', 
          waterproof: true 
        }
      },
      {
        productId: '195901924574581',
        name: 'Tennis Balls (Pack of 4)',
        price: 195000,
        description: 'Competition-grade tennis balls',
        imageUrl: 'https://contents.mediadecathlon.com/p2438464/sq/k$e112bb45b013779db589349ce84c75e9/b%C3%B3ng-tennis-thi-%C4%91%E1%BA%A5u-m%E1%BB%8Di-m%E1%BA%B7t-s%C3%A2n-tb930-v%C3%A0ng-artengo-8576144.jpg',
        category: 'Tennis',
        brand: 'Artengo',
        weight: 260,
        attributes: { 
          color: 'Yellow', 
          quantity: 4, 
          type: 'All court' 
        }
      },
      {
        productId: '280726016838505',
        name: 'Women\'s Running Shorts',
        price: 280000,
        description: 'Lightweight running shorts with inner lining',
        imageUrl: 'https://contents.mediadecathlon.com/p2048312/sq/k$0bf2850fbf33338bb7d8cb37956dbe19/qu%E1%BA%A7n-short-ch%E1%BA%A1y-b%E1%BB%99-n%E1%BB%AF-run-dry-%C4%91en-kalenji-8553338.jpg',
        category: 'Running',
        brand: 'Kalenji',
        weight: 80,
        attributes: { 
          color: 'Black', 
          size: 'S', 
          material: 'Polyester' 
        }
      },
      {
        productId: '231299537301162',
        name: 'Golf Beginner Set',
        price: 3200000,
        description: 'Complete beginner golf set with bag and clubs',
        imageUrl: 'https://contents.mediadecathlon.com/p1656854/sq/k$0c566ab7d3238e4dd9913c9bfb4dbd12/b%E1%BB%99-kit-ch%C6%A1i-golf-junior-8-10-tu%E1%BB%95i-thu%E1%BA%ADn-tay-ph%E1%BA%A3i-inesis-8519908.jpg',
        category: 'Golf',
        brand: 'Inesis',
        weight: 7500,
        attributes: { 
          clubsIncluded: '7 clubs + putter', 
          orientation: 'Right-handed', 
          bagIncluded: true 
        }
      },
      {
        productId: '069061511643851',
        name: 'Fitness Resistance Bands Set',
        price: 260000,
        description: 'Set of 3 resistance bands with different strengths',
        imageUrl: 'https://contents.mediadecathlon.com/p2743201/sq/k$45f245b00da82af0bfedda4b6c39704c/b%E1%BB%99-5-d%C3%A2y-kh%C3%A1ng-l%E1%BB%B1c-t%E1%BA%ADp-t%E1%BA%A1-domyos-8920546.jpg',
        category: 'Fitness Accessories',
        brand: 'Domyos',
        weight: 320,
        attributes: { 
          resistanceLevels: 'Light, Medium, Heavy', 
          material: 'Natural latex', 
          includes: 'Carrying bag' 
        }
      },
      {
        productId: '273920467096931',
        name: 'Badminton Racket Set',
        price: 480000,
        description: 'Set of 2 badminton rackets with 3 shuttlecocks',
        imageUrl: 'https://contents.mediadecathlon.com/p2580951/sq/k$a2fac23e8716589303028945693b9bb5/b%E1%BB%99-v%E1%BB%A3t-c%E1%BA%A7u-l%C3%B4ng-ng%C6%B0%E1%BB%9Di-l%E1%BB%9Bn-br130-xanh-l%C3%A1-xanh-d%C6%B0%C6%A1ng-perfly-8872722.jpg',
        category: 'Racket Sports',
        brand: 'Perfly',
        weight: 480,
        attributes: { 
          color: 'Blue/Red', 
          racketType: 'Aluminum frame', 
          includes: '2 rackets, 3 shuttlecocks' 
        }
      },
      {
        productId: '050525986592680',
        name: 'Men\'s Trail Running Shoes',
        price: 1350000,
        description: 'Trail running shoes with grip for off-road running',
        imageUrl: 'https://contents.mediadecathlon.com/p2941947/sq/k$86ed980a5ebe370ef7ef170b87ef86b2/gi%C3%A0y-ch%E1%BA%A1y-trail-nam-mt-cushion-2-xanh-ng%E1%BB%8Dc-v%C3%A0ng-kiprun-8931414.jpg',
        category: 'Footwear',
        brand: 'Kalenji',
        weight: 320,
        attributes: { 
          color: 'Grey/Orange', 
          size: '44', 
          terrain: 'Trail' 
        }
      },
      {
        productId: '214077535555832',
        name: 'Camping Tent 2-Person',
        price: 1850000,
        description: 'Waterproof camping tent for 2 persons with quick setup',
        imageUrl: 'https://contents.mediadecathlon.com/p2494463/sq/k$dec5003ec96b24286b9658597a37bf90/l%E1%BB%81u-c%E1%BA%AFm-tr%E1%BA%A1i-cho-2-ng%C6%B0%E1%BB%9Di-2-seconds-f-b-tr%E1%BA%AFng-quechua-8357352.jpg',
        category: 'Camping',
        brand: 'Quechua',
        weight: 2300,
        attributes: { 
          color: 'Green', 
          capacity: '2 persons', 
          waterproofRating: '2000mm' 
        }
      },
      {
        productId: '159184018770370',
        name: 'Basketball Indoor Shoes',
        price: 980000,
        description: 'High-grip shoes designed for indoor basketball',
        imageUrl: 'https://contents.mediadecathlon.com/p2572249/sq/k$258521f5bd1a69e5d4f911189f10f14b/gi%C3%A0y-b%C3%B3ng-r%E1%BB%95-tr%E1%BA%BB-em-c%E1%BB%95-cao-se-100-tr%E1%BA%AFng-tarmak-8851809.jpg',
        category: 'Footwear',
        brand: 'Tarmak',
        weight: 360,
        attributes: { 
          color: 'White/Red', 
          size: '42', 
          ankleSupport: 'Medium' 
        }
      },
      {
        productId: '132914190412970',
        name: 'Cycling Water Bottle 750ml',
        price: 120000,
        description: 'BPA-free water bottle for cycling with easy-grip design',
        imageUrl: 'https://contents.mediadecathlon.com/p2307595/sq/k$2f4c2953fb570fd4753d8d6a3cb9bb95/b%C3%ACnh-n%C6%B0%E1%BB%9Bc-%C4%91%E1%BA%A1p-xe-650-ml-c%C6%A1%CC%83-m-fastflow-v%C3%A0ng-van-rysel-8767394.jpg',
        category: 'Cycling',
        brand: 'BTWIN',
        weight: 110,
        attributes: { 
          color: 'Transparent/Blue', 
          capacity: '750ml', 
          material: 'BPA-free plastic' 
        }
      },
      {
        productId: '259807267669583',
        name: 'Kids Swimming Float Vest',
        price: 380000,
        description: 'Swimming vest for kids learning to swim',
        imageUrl: 'https://contents.mediadecathlon.com/p2840873/sq/k$af2f768b036ce50235ccd765762baeaa/%C3%A1o-phao-b%C6%A1i-g%E1%BA%AFn-tay-tr%E1%BA%BB-em-cam-nabaiji-8798021.jpg',
        category: 'Swimming',
        brand: 'Nabaiji',
        weight: 300,
        attributes: { 
          color: 'Blue/Orange', 
          size: '4-5 years', 
          buoyancyType: 'Adjustable' 
        }
      },
      {
        productId: '185708250366245',
        name: 'Yoga Block Set',
        price: 280000,
        description: 'Set of 2 yoga blocks for support during poses',
        imageUrl: 'https://contents.mediadecathlon.com/p2940719/sq/k$a9306d110baaac8ff6853ea975ac88a7/ga%CC%A3ch-yoga-g%E1%BB%97-b%E1%BA%A7n-thi%E1%BA%BFt-k%E1%BA%BF-sinh-th%C3%A1i-kimjaly-8577670.jpg',
        category: 'Yoga',
        brand: 'Domyos',
        weight: 450,
        attributes: { 
          color: 'Purple', 
          material: 'EVA foam', 
          dimensions: '23cm x 15cm x 7.5cm' 
        }
      },
      {
        productId: '218885143799750',
        name: 'Adult Snorkeling Mask',
        price: 520000,
        description: 'Full-face snorkeling mask with panoramic view',
        imageUrl: 'https://contents.mediadecathlon.com/p2656402/sq/k$6830a304ff42396bfa359845f69720a0/b%E1%BB%99-m%E1%BA%B7t-n%E1%BA%A1-l%E1%BA%B7n-v%C3%A0-%E1%BB%91ng-th%E1%BB%9F-ng%C6%B0%E1%BB%9Di-l%E1%BB%9Bn-100-comfort-v%C3%A0-drytop-xanh-d%C6%B0%C6%A1ng-subea-8882381.jpg',
        category: 'Water Sports',
        brand: 'Subea',
        weight: 390,
        attributes: { 
          color: 'Blue/Black', 
          size: 'S/M', 
          viewType: '180° panoramic' 
        }
      },
      {
        productId: '191595654983932',
        name: 'Football Size 5',
        price: 350000,
        description: 'Standard size football for grass or turf',
        imageUrl: 'https://contents.mediadecathlon.com/p2268310/sq/k$e41b35b930839e06a6e836da0ca142ab/qua%CC%89-bo%CC%81ng-%C4%91%C3%A1-c%C6%A1%CC%83-5-tuy%E1%BB%83n-t%C3%A2y-ban-nha-kipsta-8668646.jpg',
        category: 'Team Sports',
        brand: 'Kipsta',
        weight: 420,
        attributes: { 
          color: 'White/Blue', 
          size: '5', 
          material: 'Synthetic leather' 
        }
      },
      {
        productId: '085186758419164',
        name: 'Gym Dumbbell Set 20kg',
        price: 1250000,
        description: 'Adjustable dumbbells set with weights from 2kg to 20kg',
        imageUrl: 'https://contents.mediadecathlon.com/p2720297/sq/k$2db4b38c2211972559f6d27c44de7274/set-2-t%E1%BA%A1-c%E1%BA%A7m-tay-t%E1%BA%ADp-th%E1%BB%83-h%C3%ACnh-2kg-xanh-d%C6%B0%C6%A1ng-domyos-8738637.jpg',
        category: 'Fitness Equipment',
        brand: 'Domyos',
        weight: 20000,
        attributes: { 
          maxWeight: '20kg', 
          adjustable: true, 
          includes: 'Storage case' 
        }
      }
    ];
    
    await this.productModel.insertMany(products);
    
    this.logger.log(`Seeded ${products.length} products successfully`);
  }
}