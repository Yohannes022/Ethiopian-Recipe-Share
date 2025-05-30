import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IReview } from '../interfaces/review.interface';
import { CreateReviewDto, UpdateReviewDto } from '../dto/review.dto';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectModel('Review') private readonly reviewModel: Model<IReview>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<IReview> {
    const createdReview = new this.reviewModel(createReviewDto);
    return createdReview.save();
  }

  async findById(id: string): Promise<IReview | null> {
    return this.reviewModel.findById(id).exec();
  }

  async findByRecipe(recipeId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ targetId: recipeId, isApproved: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email avatar')
        .lean(),
      this.reviewModel.countDocuments({ targetId: recipeId, isApproved: true }),
    ]);

    return {
      data: reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateData: UpdateReviewDto): Promise<IReview | null> {
    return this.reviewModel
      .findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.reviewModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async getReviewStats(recipeId: string) {
    const result = await this.reviewModel.aggregate([
      {
        $match: { 
          targetId: recipeId,
          isApproved: true 
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: {
              $cond: [
                { $and: [{ $gte: ['$rating', 1] }, { $lte: ['$rating', 5] }] },
                { $toInt: '$rating' },
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1,
          ratingDistribution: {
            $map: {
              input: [1, 2, 3, 4, 5],
              as: 'rating',
              in: {
                rating: '$$rating',
                count: {
                  $size: {
                    $filter: {
                      input: '$ratingCounts',
                      as: 'r',
                      cond: { $eq: ['$$r', '$$rating'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({
          rating,
          count: 0,
        })),
      };
    }

    return result[0];
  }

  async hasUserReviewed(userId: string, recipeId: string): Promise<boolean> {
    const count = await this.reviewModel.countDocuments({ 
      userId, 
      targetId: recipeId 
    });
    return count > 0;
  }
}
