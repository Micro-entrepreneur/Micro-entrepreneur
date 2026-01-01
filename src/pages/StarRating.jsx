import { useState } from 'react';
import './StarRating.css';

const StarRating = () => {
  const [rating, setRating] = useState(0);

  const handleStarClick = (index) => {
    setRating(index + 1);
  };

  return (
    <div>
      <h2>리뷰 작성 폼</h2>

      <div className="star_rating">
        {[...Array(5)].map((_, index) => (
          <span key={index} className={`star ${index < rating ? 'on' : ''}`} onClick={() => handleStarClick(index)}>
            {index < rating ? <img src="/img/star_on.png" alt="별점 on" /> : <img src="/img/star_off.png" alt="별점 off" />}
          </span>
        ))}
      </div>

      <textarea name="" id="" className="star_box" placeholder="리뷰 내용을 작성해주세요"></textarea>

      <input type="submit" class="btn02" value="리뷰 등록" />
    </div>
  );
};

export default StarRating;
