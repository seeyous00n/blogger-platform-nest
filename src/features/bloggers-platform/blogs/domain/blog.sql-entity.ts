import { DeletionStatus } from '../../../user-accounts/domain/user.sql-entity';
import { CreateBlogInstanceSqlDto } from '../dto/sql-dto/create-blog.sql-dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

export const blogNameConstraints = {
  maxLength: 15,
};

export const blogDescriptionConstraints = {
  maxLength: 500,
};

export const blogWebsiteUrlConstraints = {
  maxLength: 100,
};

export class Blog {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  deletionStatus: boolean;
  createdAt: Date;

  static createInstance(data: CreateBlogInstanceSqlDto): Blog {
    const dto = new Blog();
    dto.id = String(data.id);
    dto.name = data.name;
    dto.description = data.description;
    dto.websiteUrl = data.website_url;
    dto.isMembership = data.is_membership;
    dto.deletionStatus = data.deletion_status;
    dto.createdAt = data.created_at;

    return dto;
  }

  update(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  makeDeleted() {
    if (this.deletionStatus !== Boolean(DeletionStatus.NotDeleted)) {
      throw new Error('Entity already deleted');
    }

    this.deletionStatus = Boolean(DeletionStatus.PermanentDeleted);
  }
}
