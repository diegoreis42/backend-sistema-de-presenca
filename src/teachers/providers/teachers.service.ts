import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { GetUsersParamDto } from '../dtos/get-teacher-param.dto';
import { Repository } from 'typeorm';
import { Teacher } from '../teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { PatchTeacherDto } from '../dtos/patch-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  public async getTeachers(getUsersParamDto: GetUsersParamDto) {
    if (getUsersParamDto.id) {
      return await this.findOneById(getUsersParamDto.id);
    }
    return await this.findAll();
  }

  public async findAll() {
    let teachers = undefined;

    try {
      teachers = await this.teacherRepository.find();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unbale to process your request at the moment, please try later.',
        {
          description: 'Error connecting to the database.',
        },
      );
    }
    return teachers;
  }

  public async findOneById(id: number) {
    let teacher = undefined;
    try {
      teacher = await this.teacherRepository.findOneBy({
        id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unbale to process your request at the moment, please try later.',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    // Handle the teacher does not exist
    if (!teacher) {
      throw new BadRequestException('The teacher ID does not exist');
    }

    return teacher;
  }

  public async createTeacher(createTeacherDto: CreateTeacherDto) {
    let existingTeacher = undefined;

    try {
      // Checking if already exist an user with same email
      existingTeacher = await this.teacherRepository.findOne({
        where: { email: createTeacherDto.email },
      });
    } catch (error) {
      // Might save the details of the exception
      // Information which is sensitive
      throw new RequestTimeoutException(
        'Unbale to process your request at the moment, please try later.',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    // Handle exception
    if (existingTeacher) {
      throw new BadRequestException(
        'The teacher already exists, please check your email.',
      );
    }

    // Create a new user
    let newTeacher = this.teacherRepository.create(createTeacherDto);

    try {
      newTeacher = await this.teacherRepository.save(newTeacher);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unbale to process your request at the moment, please try later.',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    return newTeacher;
  }

  public async updateTeacher(patchTeacherDto: PatchTeacherDto) {
    // Find the Teacher
    let teacher = undefined;

    try {
      teacher = await this.teacherRepository.findOneBy({
        id: patchTeacherDto.id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unbale to process your request at the moment, please try later.',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    if (!teacher) {
      throw new BadRequestException('The post ID does not exist');
    }

    // Update the properties
    teacher.name = patchTeacherDto.name ?? patchTeacherDto.name;
    teacher.email = patchTeacherDto.email ?? patchTeacherDto.email;
    teacher.password = patchTeacherDto.password ?? patchTeacherDto.password;
    teacher.dateBirth = patchTeacherDto.dateBirth ?? patchTeacherDto.dateBirth;
    teacher.cpf = patchTeacherDto.cpf ?? patchTeacherDto.cpf;
    teacher.cellphone = patchTeacherDto.cellphone ?? patchTeacherDto.cellphone;

    // Save the Teacher
    try {
      await this.teacherRepository.save(teacher);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unbale to process your request at the moment, please try later.',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    return teacher;
  }

  public async deleteTeacher(id: number) {
    try {
      // Deleting the post
      await this.teacherRepository.delete(id);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unbale to process your request at the moment, please try later.',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    // Confirmation
    return { deleted: true, id };
  }
}
